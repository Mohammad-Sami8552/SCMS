package com.intern.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.postgresql.PGConnection;
import org.postgresql.PGNotification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Service
public class PostgresNotificationListener {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private Connection connection;
    private Thread listenerThread;
    private boolean running = true;

    public PostgresNotificationListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void startListening() {
        listenerThread = new Thread(() -> {
            try {
                // Open a raw connection explicitly for continuous listening
                connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                PGConnection pgConnection = connection.unwrap(PGConnection.class);

                try (Statement stmt = connection.createStatement()) {
                    stmt.execute("LISTEN user_notification");
                }

                while (running) {
                    // Check for new notifications from PostgreSQL
                    PGNotification[] notifications = pgConnection.getNotifications(500); // 500ms timeout

                    if (notifications != null) {
                        for (PGNotification notification : notifications) {
                            processNotification(notification.getParameter());
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        listenerThread.setDaemon(true);
        listenerThread.start();
    }

    private void processNotification(String payload) {
        try {
            // Parse the JSON text sent by DB trigger
            JsonNode rootNode = objectMapper.readTree(payload);
            int userId = rootNode.get("user_id").asInt();
            String message = rootNode.get("message").asText();

            // Push targeted WebSocket message to specific subscriber path: /topic/notifications/{userId}
            String destination = "/topic/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, message);

        } catch (Exception e) {
            System.err.println("Error parsing database notification payload: " + e.getMessage());
        }
    }

    @PreDestroy
    public void stopListening() {
        running = false;
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (Exception e) {
            // Log clean up error if necessary
        }
    }
}