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
            while (running) {
                try {
                    // Establishes a raw persistent socket pipeline connection to PostgreSQL
                    connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                    PGConnection pgConnection = connection.unwrap(PGConnection.class);

                    try (Statement stmt = connection.createStatement()) {
                        stmt.execute("LISTEN user_notification");
                    }

                    // Keep reading notifications; reconnect if the connection fails
                    while (running && connection != null && !connection.isClosed()) {
                        try {
                            PGNotification[] notifications = pgConnection.getNotifications(500);
                            if (notifications != null) {
                                for (PGNotification notification : notifications) {
                                    processNotification(notification.getParameter());
                                }
                            }
                        } catch (Exception inner) {
                            System.err.println("Postgres listener I/O error: " + inner.getMessage());
                            // break inner loop to attempt reconnect
                            break;
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error establishing PostgreSQL listener: " + e.getMessage());
                    e.printStackTrace();
                } finally {
                    // Ensure connection closed before retrying
                    try {
                        if (connection != null && !connection.isClosed()) connection.close();
                    } catch (Exception ignored) {}
                }

                // If still running, wait a bit before retrying connection
                if (running) {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        });
        listenerThread.setDaemon(true);
        listenerThread.start();
    }

    private void processNotification(String payload) {
        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            String receiverUsername = null;
            if (rootNode.has("receiver_username")) {
                receiverUsername = rootNode.get("receiver_username").asText();
            } else if (rootNode.has("username")) {
                receiverUsername = rootNode.get("username").asText();
            }
            String message = rootNode.has("message") ? rootNode.get("message").asText() : null;

            if (receiverUsername == null || receiverUsername.isBlank() || message == null) {
                return;
            }

            String destination = "/topic/notifications/" + receiverUsername;
            messagingTemplate.convertAndSend(destination, message);

        } catch (Exception e) {
            System.err.println("Failed parsing notification payload string context: " + e.getMessage());
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
            // Clean up threads silently on container exit
        }
    }
}