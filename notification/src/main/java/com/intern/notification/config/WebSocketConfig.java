package com.intern.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the url that frontend clients will use to start the initial connection handshake
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();

    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry)
    {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
