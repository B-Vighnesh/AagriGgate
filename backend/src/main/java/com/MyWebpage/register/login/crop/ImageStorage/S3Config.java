package com.MyWebpage.register.login.crop.ImageStorage;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

//@Profile("prod")
@Configuration
public class S3Config {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key-id:#{null}}")
    private String accessKeyId;

    @Value("${aws.secret-access-key:#{null}}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region));

        // Use credentials if provided (local dev)
        // Otherwise use IAM role (EC2 production)
        if (accessKeyId != null && secretAccessKey != null) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                    )
            );
        }

        return builder.build();
    }
}