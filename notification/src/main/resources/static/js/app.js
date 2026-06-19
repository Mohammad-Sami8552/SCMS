let stompClient = null;

/**
 * Initiates the WebSocket handshake connection and handles channel subscription
 */
function connectWebSocket() {
    const userId = document.getElementById('current-user').value;

    // Clean up any existing connection session if user switches profiles
    if (stompClient !== null) {
        stompClient.disconnect();
    }

    // Create a connection pointing to our Spring Boot backend endpoint mapping
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Connected to WebSocket Session: ' + frame);

        // Dynamically subscribe to the unique channel destination for this specific user
        const topicRoute = '/topic/notifications/' + userId;

        stompClient.subscribe(topicRoute, function (response) {
            displayIncomingAlert(response.body);
        });

        alert("Successfully listening to notifications intended for User ID: " + userId);
    }, function(error) {
        console.error("STOMP protocol connection failure: ", error);
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

    // Inserts the newest notification alert at the top of the list view stack
    displayArea.insertBefore(element, displayArea.firstChild);
}

/**
 * Dispatches an HTTP POST API request carrying our notification payload back to Spring Boot
 */
function sendNotificationViaRest() {
    const targetId = document.getElementById('target-user').value;
    const textContext = document.getElementById('msg').value;

    if (!textContext.trim()) {
        alert("Message field shouldn't be empty");
        return;
    }

    const requestPayload = {
        userId: targetId,
        message: textContext
    };

    fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
    })
    .then(res => {
        if (res.ok) {
            // Clear out input message field content upon a successful API handoff
            document.getElementById('msg').value = '';
        } else {
            alert("Error processing transaction through server API context");
        }
    })
    .catch(err => {
        console.error("Failed to execute fetch sequence:", err);
    });
}