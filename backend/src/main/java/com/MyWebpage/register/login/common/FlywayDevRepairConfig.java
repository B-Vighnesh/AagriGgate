package com.MyWebpage.register.login.common;

import org.flywaydb.core.api.exception.FlywayValidateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class FlywayDevRepairConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayDevRepairConfig.class);

    @Bean
    @ConditionalOnProperty(name = "app.flyway.repair-on-validation-error", havingValue = "true")
    FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                flyway.migrate();
            } catch (FlywayValidateException ex) {
                if (!canRepairInDev(ex)) {
                    throw ex;
                }

                log.warn("Flyway validation failed in the dev profile. Repairing schema history and retrying migration.");
                flyway.repair();
                flyway.migrate();
            }
        };
    }

    private boolean canRepairInDev(FlywayValidateException ex) {
        if (ex.getMessage() == null) {
            return false;
        }

        return ex.getMessage().contains("Migration checksum mismatch")
                || ex.getMessage().contains("Detected failed migration");
    }
}
