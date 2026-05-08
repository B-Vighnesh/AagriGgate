package com.MyWebpage.register.login.crop.ImageStorage;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Creates the S3Client bean for the prod profile only.
 *
 * Credentials are NOT configured here — they are automatically
 * picked up from the EC2 instance's IAM role by the AWS SDK.
 * Never put AWS access keys in code or yml files.
 *
 * Required env var on EC2:
 *   AWS_REGION=ap-south-1   (or whichever region your bucket is in)
 *
 * Required application-prod.yml entry:
 *   aws:
 *     region: ${AWS_REGION}
 *     s3:
 *       bucket: ${AWS_S3_BUCKET}
 */
@Configuration
@Profile("prod")
public class S3Config {

    @Value("${aws.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                // No credentials provider needed — EC2 IAM role is used automatically
                .build();
    }
}