package com.intern.notification.service;

import com.intern.notification.model.Notification;
import com.intern.notification.repository.NotificationRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class NotificationPresenceService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final ConcurrentMap<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    public NotificationPresenceService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        String destination = sha.getDestination();
        String sessionId = sha.getSessionId();

        if (destination != null && destination.startsWith("/topic/notifications/")) {
            String username = destination.substring("/topic/notifications/".length());
            userSessions.computeIfAbsent(username, key -> ConcurrentHashMap.newKeySet()).add(sessionId);
            deliverPendingNotifications(username);
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        if (sessionId == null) {
            return;
        }

        userSessions.forEach((username, sessions) -> {
            if (sessions.remove(sessionId) && sessions.isEmpty()) {
                userSessions.remove(username, Collections.emptySet());
            }
        });
    }

    public boolean isUserConnected(String username) {
        return username != null && userSessions.containsKey(username) && !userSessions.get(username).isEmpty();
    }

    public int getPendingCount(String username) {
        return notificationRepository.countByReceiverUsernameAndDeliveredFalse(username);
    }

    private void deliverPendingNotifications(String username) {
        List<Notification> pending = notificationRepository.findByReceiverUsernameAndDeliveredFalseOrderByCreatedAtDesc(username);
        if (pending == null || pending.isEmpty()) {
            return;
        }

        for (Notification notification : pending) {
            messagingTemplate.convertAndSend("/topic/notifications/" + username, notification.getMessage());
            notification.setDelivered(true);
        }
        notificationRepository.saveAll(pending);
    }
}
