package com.intern.notification.controller;

import com.intern.notification.model.Notification;
import com.intern.notification.repository.NotificationRepository;
import com.intern.notification.service.NotificationPresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationPresenceService presenceService;
    private final NotificationRepository notificationRepository;
    private final JdbcTemplate jdbcTemplate;

    public NotificationController(SimpMessagingTemplate messagingTemplate, NotificationPresenceService presenceService, NotificationRepository notificationRepository, JdbcTemplate jdbcTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.presenceService = presenceService;
        this.notificationRepository = notificationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, Object> payload) {
        try {
            Object usernameObj = payload.get("username");
            Object messageObj = payload.get("message");
            String message = messageObj == null ? "" : messageObj.toString();

            if (usernameObj == null || usernameObj.toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Receiver username is required.");
            }

            if (message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message content is required.");
            }

            String username = usernameObj.toString().trim();
            if (!doesUserExist(username)) {
                return ResponseEntity.badRequest().body("Receiver username does not exist.");
            }

            Integer userId = getUserIdByUsername(username);
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setReceiverUsername(username);
            notification.setMessage(message);
            notification.setDelivered(false);
            notificationRepository.save(notification);
            String destination = "/topic/notifications/" + username;

            if (presenceService.isUserConnected(username)) {
                notification.setDelivered(true);
                notificationRepository.save(notification);
                messagingTemplate.convertAndSend(destination, message);
                return ResponseEntity.ok("Notification delivered live.");
            } else {
                return ResponseEntity.ok("Receiver is offline. Message saved and will be delivered when they connect.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing notification: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Notification>> getNotificationHistory(@RequestParam String username) {
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (!doesUserExist(username.trim())) {
            return ResponseEntity.badRequest().build();
        }
        List<Notification> notifications = notificationRepository.findByReceiverUsernameOrderByCreatedAtDesc(username.trim());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@RequestParam String username) {
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("count", 0));
        }

        if (!doesUserExist(username.trim())) {
            return ResponseEntity.badRequest().body(Map.of("count", 0));
        }

        int count = notificationRepository.countByReceiverUsernameAndDeliveredFalse(username.trim());
        return ResponseEntity.ok(Map.of("count", count));
    }

    private boolean doesUserExist(String username) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM config.user_mapping WHERE username = ?",
                Integer.class,
                username
        );
        return count != null && count > 0;
    }

    private Integer getUserIdByUsername(String username) {
        return jdbcTemplate.queryForObject(
                "SELECT userid FROM config.user_mapping WHERE username = ?",
                Integer.class,
                username
        );
    }
}