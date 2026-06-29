let stompClient = null;
let currentUsername = null;
let unreadCount = 0;

function getUsernameFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    return username ? username.trim() : null;
}

function initNotificationPage() {
    currentUsername = getUsernameFromQuery();

    if (currentUsername) {
        connectWebSocket();
        loadNotificationHistory();
    } else {
        console.error("Username must be provided in the notification page URL.");
    }
}

/**
 * Initiates the WebSocket handshake connection and handles channel subscription
 */
function connectWebSocket() {
    if (!currentUsername) {
        console.error("No username available to connect to WebSocket.");
        return;
    }

    if (stompClient !== null) {
        stompClient.disconnect();
    }

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        const topicRoute = '/topic/notifications/' + currentUsername;

        stompClient.subscribe(topicRoute, function (response) {
            displayIncomingAlert(response.body);
        });
    }, function(error) {
        console.error("STOMP protocol connection failure: ", error);
    });
}

function setUnreadBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('active');
    } else {
        badge.textContent = '';
        badge.classList.remove('active');
    }
}

function clearNotifications() {
    const displayArea = document.getElementById('notifications-display');
    displayArea.innerHTML = '';
    unreadCount = 0;
    setUnreadBadge(0);
}

function loadNotificationHistory() {
    if (!currentUsername) {
        return;
    }

    fetch(`/api/notifications/history?username=${encodeURIComponent(currentUsername)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to load notification history');
            }
            return res.json();
        })
        .then(notifications => {
            const displayArea = document.getElementById('notifications-display');
            displayArea.innerHTML = '';
            notifications.reverse().forEach(notification => {
                const element = document.createElement('li');
                const timeStamp = new Date(notification.createdAt).toLocaleTimeString();
                element.innerHTML = `<strong>[${timeStamp}]</strong> ${notification.message}`;
                displayArea.insertBefore(element, displayArea.firstChild);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

/**
 * Appends the real-time message payload cleanly into the dashboard list view
 */
function displayIncomingAlert(message) {
    const displayArea = document.getElementById('notifications-display');
    const element = document.createElement('li');
    const timeStamp = new Date().toLocaleTimeString();

    element.innerHTML = `<strong>[${timeStamp}]</strong> ${message}`;
    displayArea.insertBefore(element, displayArea.firstChild);

    unreadCount += 1;
    setUnreadBadge(unreadCount);
}

/**
 * Dispatches an HTTP POST API request carrying our notification payload back to Spring Boot
 */
function sendNotificationViaRest() {
    const targetUsername = document.getElementById('target-user').value.trim();
    const textContext = document.getElementById('msg').value;

    if (!currentUsername) {
        alert("Please login first before sending notifications.");
        return;
    }

    if (!targetUsername) {
        alert("Please enter the receiver's username.");
        return;
    }

    if (!textContext.trim()) {
        alert("Message field shouldn't be empty");
        return;
    }

    const requestPayload = {
        username: targetUsername,
        message: textContext
    };

    fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
    })
    .then(async res => {
        const text = await res.text();
        if (res.ok) {
            document.getElementById('msg').value = '';
            setUnreadBadge(unreadCount);
            alert(text || 'Notification sent successfully.');
        } else {
            alert(text || 'Error processing notification through server API context.');
        }
    })
    .catch(err => {
        console.error('Failed to execute fetch sequence:', err);
        alert('Unable to send notification. Please try again.');
    });
}

document.addEventListener('DOMContentLoaded', initNotificationPage);