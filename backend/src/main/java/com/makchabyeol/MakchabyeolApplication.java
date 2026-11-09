package com.makchabyeol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // RetentionJob(90일 지난 기록 삭제)
public class MakchabyeolApplication {

    public static void main(String[] args) {
        SpringApplication.run(MakchabyeolApplication.class, args);
    }
}
