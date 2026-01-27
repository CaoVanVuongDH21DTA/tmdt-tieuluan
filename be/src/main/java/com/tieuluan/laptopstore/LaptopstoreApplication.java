package com.tieuluan.laptopstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LaptopstoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(LaptopstoreApplication.class, args);
	}

}
