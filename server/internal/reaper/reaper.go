// Package reaper hard-deletes accounts whose 7-day deletion grace period has
// elapsed, purging both their database rows and their R2-stored objects.
package reaper

import (
	"context"
	"log"
	"time"

	"chat-backend/internal/media"
	"chat-backend/internal/store"
)

// Grace is how long a user has to cancel (by logging back in) before their
// account is permanently purged.
const Grace = 7 * 24 * time.Hour

type Reaper struct {
	store    *store.Store
	media    *media.R2 // may be nil if storage is disabled
	interval time.Duration
}

func New(st *store.Store, r2 *media.R2, interval time.Duration) *Reaper {
	return &Reaper{store: st, media: r2, interval: interval}
}

// Run sweeps immediately, then on every interval tick until ctx is cancelled.
func (r *Reaper) Run(ctx context.Context) {
	r.Sweep(ctx)
	t := time.NewTicker(r.interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			r.Sweep(ctx)
		}
	}
}

// Sweep purges every account whose grace period has fully elapsed.
func (r *Reaper) Sweep(ctx context.Context) {
	cutoff := time.Now().Add(-Grace)
	users, err := r.store.UsersPendingPurge(ctx, cutoff)
	if err != nil {
		log.Printf("reaper: list pending: %v", err)
		return
	}
	for _, u := range users {
		if err := r.purge(ctx, u); err != nil {
			log.Printf("reaper: purge %s: %v", u.ID, err)
		} else {
			log.Printf("reaper: purged account %s", u.ID)
		}
	}
}

// purge gathers the user's R2 object keys, deletes their DB rows, then removes
// the objects. DB deletion happens first so a storage hiccup can't leave the
// account half-alive; orphaned objects are the safer failure mode.
func (r *Reaper) purge(ctx context.Context, u *store.User) error {
	var keys []string
	if r.media != nil {
		if u.AvatarURL != nil {
			if k := r.media.ObjectKeyFromURL(*u.AvatarURL); k != "" {
				keys = append(keys, k)
			}
		}
		if u.CoverURL != nil {
			if k := r.media.ObjectKeyFromURL(*u.CoverURL); k != "" {
				keys = append(keys, k)
			}
		}
		if attKeys, err := r.store.UserAttachmentKeys(ctx, u.ID); err == nil {
			keys = append(keys, attKeys...)
		} else {
			log.Printf("reaper: attachment keys %s: %v", u.ID, err)
		}
	}

	if err := r.store.DeleteAccount(ctx, u.ID); err != nil {
		return err
	}

	for _, k := range keys {
		if err := r.media.DeleteObject(ctx, k); err != nil {
			log.Printf("reaper: delete object %s: %v", k, err)
		}
	}
	return nil
}
