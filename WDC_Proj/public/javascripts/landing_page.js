// Function to fetch permission level from the server and update page HTML
function updatePageBasedOnPermissionLevel_landing() {
    // console.log("updating div");

    fetch('/get_user_permission_level')
        .then(response => response.json())
        .then(data => {
            const permissionLevel = data.permissionLevel;

            // console.log(permissionLevel);

            var element;

            // Use permission level to customize client-side behavior
            if (permissionLevel === 0) {

                element = document.getElementById('events-title-wrapper');
                element.classList.add('hidden-landing');

                element = document.getElementById('events-wrapper');
                element.classList.add('hidden-landing');

            } else {
                element = document.getElementById('events-title-wrapper');
                element.classList.remove('hidden-landing');

                element = document.getElementById('events-wrapper');
                element.classList.remove('hidden-landing');
            }
        })
        .catch(error => {
            console.error('Error fetching permission level:', error);
        });
}

function createOrganizationCards() {
    // Get the parent div to which the organization cards will be appended
    const gridContainer = document.getElementById('grid-container');

    // Make a fetch request to the server to get organization names
    fetch('/organizations/get_cards')
        .then(response => response.json())
        .then(data => {
                gridContainer.innerHTML = "";
                data.forEach(organization => {
                // Create the anchor element for redirection
                const anchor = document.createElement('a');
                anchor.href = `/organizations/info/${organization.organization_id}`;
                anchor.classList.add('organization-card-link' , 'fade-in'); // Optional: Add a class for styling

                // Create the div element for the organization card
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');

                // Create the image element
                const img = document.createElement('img');
                if (organization.organization_image === null) {
                    img.src = "/images/allium_logo.png"; // Default image if null
                    img.alt = 'No image found';
                } else {
                    const base64img = arrayBufferToBase64(organization.organization_image.data);
                    img.src = `data:image/png;base64,${base64img}`;
                    img.alt = 'Organization image';
                }
                 // Replace 'temp.jpg' with the actual image URL
                img.classList.add('organization-card-image');

                // Create the div element for the organization name
                const orgNameDiv = document.createElement('div');
                orgNameDiv.classList.add('organization-card-name');
                const h4 = document.createElement('h4');
                h4.textContent = organization.name; // Set the organization name
                orgNameDiv.appendChild(h4);

                // Append the image and organization name div to the organization card div
                gridItem.appendChild(img);
                gridItem.appendChild(orgNameDiv);

                // Append the organization card to the anchor
                anchor.appendChild(gridItem);

                // Append the anchor to the parent div
                gridContainer.appendChild(anchor);
            });
        })
        .catch(error => {
            console.error('Error fetching organization names:', error);
        });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Get the search input element
const searchInput = document.querySelector('.search-input');
// Attach an event listener to the search input field for input event
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase(); // Get the search term and convert to lowercase for case-insensitive search

    // Get all organization cards
    const organizationCards = document.querySelectorAll('.organization-card-link');

    // Loop through each organization card
    organizationCards.forEach(card => {
        // Get the organization name from the card
        const orgName = card.querySelector('.organization-card-name h4').textContent.toLowerCase();

        if (orgName.includes(searchTerm)) {
            card.classList.remove('fade-out');
            card.classList.add('fade-in');
            card.style.display = 'flex';
        } else {
            card.classList.add('fade-out');
            card.classList.remove('fade-in');
            card.addEventListener('animationend', function handleAnimationEnd() {
                if (card.classList.contains('fade-out')) {
                  card.style.display = 'none';
                }
                card.removeEventListener('animationend', handleAnimationEnd);
            });
        }
    });
});

//Events
function displayEvents() {
    const eventBox = document.getElementById("events-box");

    fetch('/users/get_all_events_and_updates')
        .then(response => response.json())
        .then(data => {
            eventBox.innerHTML = "";
            let htmlContent = "";

            if (data.length === 0) {
                console.log(data);
                htmlContent += `<p id="no-news">Unfortunately, it looks like nothing is happening right now.</p>`;
                eventBox.innerHTML = htmlContent;
            } else {

            data.forEach(item => {
                if (item.type === 'event') {
                    const attendanceClass = item.attendance ? 'attending' : 'not-attending';
                    const attendanceText = item.attendance ? 'Attending' : 'Not Attending';

                    // console.log(item.attendance);

                    htmlContent += `
                        <div class="events-notification">
                            <a href="/organizations/info/${item.organization_id}"><img src="${item.organization_image || '/images/allium_logo.png'}" alt="org_logo" class="events-notification-img"></a>
                            <div class="events-notification-content">
                                <h4 class="event-notification-content-title">Event: ${item.title}</h4>
                                <p>${item.description}</p>
                                <div class="event-notification-content-timestamp">
                                    <p>Posted on: ${new Date(item.post_date).toLocaleDateString()}, ${new Date(item.post_date).toLocaleTimeString()}, Location: ${item.location || 'N/A'}</p>
                                    <div id="attendance-${item.id}" class="attendance-box ${attendanceClass}" onclick="toggleAttendance(${item.id}, ${item.attendance})">
                                        ${attendanceText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (item.type === 'update') {
                    htmlContent += `
                        <div class="events-notification">
                            <a href="/organizations/info/${item.organization_id}"><img src="${item.organization_image || '/images/allium_logo.png'}" alt="org_logo" class="events-notification-img"></a>
                            <div class="events-notification-content">
                                <h4 class="event-notification-content-title">Update: ${item.title}</h4>
                                <p>${item.description}</p>
                                <div class="event-notification-content-timestamp">
                                    <p>Posted on: ${new Date(item.post_date).toLocaleDateString()}, ${new Date(item.post_date).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
                eventBox.innerHTML = htmlContent;
            });
        }
    })
    .catch(error => {
        console.error('Error fetching events and updates:', error);
        eventBox.innerHTML = `<p id="no-news">Error fetching events and updates.</p>`;
    });
}

function toggleAttendance(eventId, currentStatus) {
    const newStatus = !currentStatus;

    fetch('/users/toggle_attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId, isAttending: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Attendance updated successfully') {
            const attendanceBox = document.getElementById(`attendance-${eventId}`);
            attendanceBox.className = `attendance-box ${newStatus ? 'attending' : 'not-attending'}`;
            attendanceBox.textContent = newStatus ? 'Attending' : 'Not Attending';
            // Update the onclick handler to reflect the new status
            attendanceBox.setAttribute('onclick', `toggleAttendance(${eventId}, ${newStatus})`);
        } else {
            console.error('Error updating attendance:', data.error);
        }
    })
    .catch(error => {
        console.error('Error updating attendance:', error);
    });
}

let button = document.querySelector('.plusminus');
button.addEventListener('click', (e) => {
	e.target.classList.toggle('active');

    const eventBody = document.getElementById("events-box");
    const content = document.querySelector('.events-content');

    if (content.classList.contains('expand')) {
        content.classList.remove('expand');
        content.style.maxHeight = '200px'; // Collapse to original max-height
    } else {
        content.classList.add('expand');
        content.style.maxHeight = 1000 + 'px'; // Expand to full height of the content
    }
});

