package com.intern.notification.repository;

import com.intern.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverUsernameOrderByCreatedAtDesc(String receiverUsername);
    List<Notification> findByReceiverUsernameAndDeliveredFalseOrderByCreatedAtDesc(String receiverUsername);
    int countByReceiverUsernameAndDeliveredFalse(String receiverUsername);
}
