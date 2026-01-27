package com.tieuluan.laptopstore.auth.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.client-email}")
    private String clientEmail;

    @Value("${firebase.private-key}")
    private String privateKey;

    @Value("${firebase.private-key-id}")
    private String privateKeyId;

    @Value("${firebase.client-id}")
    private String clientId;

    @PostConstruct
    public void init() {
        try {
            // Firebase yêu cầu privateKey có dòng xuống dòng đúng định dạng PEM
            privateKey = privateKey.replace("\\n", "\n");

            String firebaseConfigJson = String.format("""
                {
                  "type": "service_account",
                  "project_id": "%s",
                  "private_key_id": "%s",
                  "private_key": "%s",
                  "client_email": "%s",
                  "client_id": "%s",
                  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                  "token_uri": "https://oauth2.googleapis.com/token",
                  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/%s"
                }
            """, projectId, privateKeyId, privateKey, clientEmail, clientId, clientEmail);

            ByteArrayInputStream serviceAccount = new ByteArrayInputStream(
                    firebaseConfigJson.getBytes(StandardCharsets.UTF_8));

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
