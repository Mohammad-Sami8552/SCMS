package com.intern.notification.controller;

import com.intern.notification.model.Notification;
import com.intern.notification.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(NotificationRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, Object> payload) {
        try {
            Integer userId = Integer.parseInt(payload.get("userId").toString());
            String message = payload.get("message").toString();

            Notification notification = new Notification(userId, message);
            repository.save(notification);

            // Send directly via WebSocket to subscribed clients as a fallback/primary path
            String destination = "/topic/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, message);

            return ResponseEntity.ok("Notification queued, saved and dispatched successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error parsing input: " + e.getMessage());
        }
    }
}