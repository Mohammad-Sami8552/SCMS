package com.intern.notification.controller;

import com.intern.notification.model.Notification;
import com.intern.notification.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, Object> payload) {
        try {
            Integer userId = Integer.parseInt(payload.get("userId").toString());
            String message = payload.get("message").toString();

            Notification notification = new Notification(userId, message);
            repository.save(notification);

            return ResponseEntity.ok("Notification queued and saved successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error parsing input: " + e.getMessage());
        }
    }
}