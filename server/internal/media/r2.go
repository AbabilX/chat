package media

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"

	"chat-backend/internal/config"
)

type R2 struct {
	presign   *s3.PresignClient
	bucket    string
	publicURL string
}

func New(cfg *config.Config) (*R2, error) {
	if cfg.R2Endpoint == "" || cfg.R2AccessKey == "" {
		return nil, fmt.Errorf("R2 credentials missing")
	}
	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.R2AccessKey, cfg.R2SecretKey, "")),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		return nil, err
	}
	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(cfg.R2Endpoint)
		o.UsePathStyle = true
	})
	publicURL := cfg.R2PublicURL
	if publicURL != "" && !strings.HasPrefix(publicURL, "http") {
		publicURL = "https://" + publicURL
	}
	return &R2{
		presign:   s3.NewPresignClient(client),
		bucket:    cfg.R2Bucket,
		publicURL: strings.TrimSuffix(publicURL, "/"),
	}, nil
}

var extByMime = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

// PresignUpload returns a presigned PUT URL plus the object key and the final
// public URL the client should embed in the message.
func (r *R2) PresignUpload(ctx context.Context, mime string) (uploadURL, objectKey, publicURL string, err error) {
	ext, ok := extByMime[mime]
	if !ok {
		return "", "", "", fmt.Errorf("unsupported mime type: %s", mime)
	}
	objectKey = "img/" + uuid.NewString() + ext
	req, err := r.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(objectKey),
		ContentType: aws.String(mime),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return "", "", "", err
	}
	return req.URL, objectKey, r.PublicURL(objectKey), nil
}

func (r *R2) PublicURL(objectKey string) string {
	return r.publicURL + "/" + objectKey
}
