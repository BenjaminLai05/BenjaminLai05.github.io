/* eslint-disable no-console */

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('id');

    if (orgId) {
        let isAuthenticated = false; // Variable to store authentication status
        let isMember = false; // Variable to store if the user is a member of the organization

        // Hide the email notifications container by default
        const emailToggleContainer = document.querySelector('.email-notifications');
        emailToggleContainer.style.display = 'none';

        // Check authentication status
        fetch(`/users/check_if_joined_organization?organization_id=${orgId}`)
            .then(response => response.json())
            .then(data => {
                isAuthenticated = data.authenticated;
                isMember = data.joined;

                if (isAuthenticated && isMember) {
                    emailToggleContainer.style.display = 'flex';

                    // Fetch current email notification status
                    fetch(`/users/get_email_notification_status?organization_id=${orgId}`)
                        .then(response => response.json())
                        .then(data => {
                            emailToggle.checked = data.receive_emails === 1;
                        })
                        .catch(error => {
                            console.error('Error fetching email notification status:', error);
                        });

                    // Add event listener for email toggle
                    emailToggle.addEventListener('change', function() {
                        const receiveEmails = emailToggle.checked ? 1 : 0;
                        fetch('/users/update_email_notification_status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                organization_id: orgId,
                                receive_emails: receiveEmails
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    console.log('Email notification status updated');
                                } else {
                                    console.error('Failed to update email notification status');
                                }
                            })
                            .catch(error => {
                                console.error('Error updating email notification status:', error);
                            });
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Check authentication status
        fetch('/users/check_login_status')
            .then(response => response.json())
            .then(data => {
                isAuthenticated = data.authenticated;

                // Fetch user's organizations if authenticated
                if (isAuthenticated) {
                    return fetch(`/users/get_user_organizations`);
                } else {
                    // Hide join and leave buttons if not authenticated
                    document.getElementById('join-button').style.display = 'none';
                    document.getElementById('leave-button').style.display = 'none';
                    throw new Error('User not authenticated');
                }
            })
            .then(response => response.json())
            .then(data => {
                isMember = data.some(org => org.organization_id == orgId);

                const joinButton = document.getElementById('join-button');
                const leaveButton = document.getElementById('leave-button');

                if (isMember) {
                    joinButton.style.display = 'none';
                    leaveButton.style.display = 'block';
                } else {
                    joinButton.style.display = 'block';
                    leaveButton.style.display = 'none';
                }

                // Event listeners for join and leave buttons
                joinButton.addEventListener('click', function() {
                    fetch(`/users/join_organization`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ organization_id: orgId })
                    })
                        .then(response => response.text())
                        .then(message => {
                            alert(message);
                            joinButton.style.display = 'none';
                            leaveButton.style.display = 'block';
                            location.reload();
                        })
                        .catch(error => {
                            const errorTab = window.open('', '_blank');
                            errorTab.document.write(error.message);
                            errorTab.document.close();
                        });
                });

                leaveButton.addEventListener('click', function() {
                    fetch(`/users/leave_organization`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ organization_id: orgId })
                    })
                        .then(response => response.text())
                        .then(message => {
                            alert(message);
                            joinButton.style.display = 'block';
                            leaveButton.style.display = 'none';
                            location.reload();
                        })
                        .catch(error => {
                            const errorTab = window.open('', '_blank');
                            errorTab.document.write(error.message);
                            errorTab.document.close();
                        });
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });

        fetch(`/organizations/page_info?organization_id=${orgId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    document.getElementById('organization-name').textContent = data.name;
                    document.getElementById('organization-description').textContent = data.body0;

                    let base64Image = null;

                    if (data.organization_image && data.organization_image.data) {
                        base64Image = arrayBufferToBase64(data.organization_image.data);
                    }

                    document.getElementById('organization-image').src = base64Image ? `data:image/jpeg;base64,${base64Image}` : '/images/allium_logo.png';
                    document.getElementById('email-link').addEventListener('click', () => {
                        window.location.href = `mailto:${data.social_link0}`;
                    });
                    document.getElementById('facebook-link').addEventListener('click', () => {
                        window.location.href = data.social_link2;
                    });
                    document.getElementById('twitter-link').addEventListener('click', () => {
                        window.location.href = data.social_link1;
                    });
                } else {
                    alert('Organization not found');
                }
            })
            .catch(error => {
                console.error('Error fetching organization data:', error);
            });

        // Check if user is a manager
        fetch(`/managers/check_user_manager_status?organization_id=${orgId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                if (data.is_manager) {
                    const manageButton = document.createElement('button');
                    manageButton.id = 'manage-button';
                    manageButton.textContent = 'Manage';
                    manageButton.addEventListener('click', () => {
                        window.location.href = `organisation_manage.html?id=${orgId}`;
                    });
                    document.querySelector('.join-contact').appendChild(manageButton);
                }
            })
            .catch(error => {
                console.error('Error checking manager status:', error);
            });

        // Fetch events and updates
        fetch(`/organizations/get_all_organization_events_and_updates_public?organization_id=${orgId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                const eventsUpdatesContainer = document.getElementById('events-updates-select');
                eventsUpdatesContainer.innerHTML = ''; // Clear previous options
                data.forEach(item => {
                    const div = document.createElement('div');
                    div.classList.add('events-notification');
                    if (item.type === 'event') {
                        if (isAuthenticated === true && isMember === true) {
                            div.innerHTML = `
                                <div class="events-notification-content" data-event-id='${item.id}'>
                                    <h3 class="event-notification-content-title">${item.title}</h3>
                                    <p>${item.description}</p>
                                    ${item.date ? `<p class="event-notification-content-timestamp">Date: ${item.date}</p>` : ''}
                                    ${item.location ? `<p class="event-notification-content-location">Location: ${item.location}</p>` : ''}
                                    <div class="attendance-box ${item.attendance ? 'attending' : 'not-attending'}">
                                        ${item.attendance ? 'Attending' : 'Not Attending'}
                                    </div>
                                </div>
                            `;
                        } else {
                            if (item.members_only === 1) {
                                div.innerHTML = `
                                <div class="events-notification-content" data-event-id='${item.id}'>
                                    <h3 class="event-notification-content-title">${item.title}</h3>
                                    <p>${item.description}</p>
                                    ${item.date ? `<p class="event-notification-content-timestamp">Date: ${item.date}</p>` : ''}
                                    ${item.location ? `<p class="event-notification-content-location">Location: ${item.location}</p>` : ''}
                                    <div class="attendance-box ${item.attendance ? 'attending' : 'not-attending'}">
                                        ${item.attendance ? 'Attending' : 'Not Attending'}
                                    </div>
                                </div>
                            `;
                            } else {
                                div.innerHTML = `
                                <div class="events-notification-content" data-event-id='${item.id}'>
                                    <h3 class="event-notification-content-title">${item.title}</h3>
                                    <p>${item.description}</p>
                                    ${item.date ? `<p class="event-notification-content-timestamp">Date: ${item.date}</p>` : ''}
                                    ${item.location ? `<p class="event-notification-content-location">Location: ${item.location}</p>` : ''}
                                </div>
                            `;
                            }
                        }
                    } else {
                        div.innerHTML = `
                            <div class="events-notification-content">
                                <h3 class="event-notification-content-title">${item.title}</h3>
                                <p>${item.description}</p>
                                ${item.date ? `<p class="event-notification-content-timestamp">Date: ${item.date}</p>` : ''}
                            </div>
                        `;
                    }
                    eventsUpdatesContainer.appendChild(div);
                });

                // Add event listeners for attendance toggle
                const attendanceButtons = document.querySelectorAll('.attendance-box');
                attendanceButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const eventId = this.parentElement.dataset.eventId;
                        const isAttending = this.classList.contains('attending');
                        fetch('/users/toggle_attendance', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                eventId: eventId,
                                isAttending: !isAttending
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.message === 'Attendance updated successfully') {
                                    if (isAttending) {
                                        this.classList.remove('attending');
                                        this.classList.add('not-attending');
                                        this.textContent = 'Not Attending';
                                    } else {
                                        this.classList.remove('not-attending');
                                        this.classList.add('attending');
                                        this.textContent = 'Attending';
                                    }
                                } else {
                                    alert('Failed to update attendance');
                                }
                            })
                            .catch(error => {
                                const errorTab = window.open('', '_blank');
                                errorTab.document.write(error.message);
                                errorTab.document.close();
                            });
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching events and updates:', error);
            });

        // Modal logic for Managers button
        const managersButton = document.getElementById('managers-button');
        const managersModal = document.getElementById('managers-modal');
        const closeModal = document.querySelector('.close');

        managersButton.addEventListener('click', () => {
            managersModal.style.display = 'block';
            fetchManagers(orgId);
        });

        closeModal.addEventListener('click', () => {
            managersModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == managersModal) {
                managersModal.style.display = 'none';
            }
        });

        function fetchManagers(orgId) {
            fetch(`/organizations/get_all_managers_of_organization?organization_id=${orgId}`)
                .then(response => response.json())
                .then(data => {
                    const managerSelect = document.getElementById('manager-select');
                    managerSelect.innerHTML = '';
                    data.forEach(manager => {
                        const option = document.createElement('option');
                        option.text = manager.display_name;
                        option.value = manager.email;
                        managerSelect.add(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching managers:', error);
                });
        }

        const emailToggle = document.getElementById('email-notifications-toggle');
    }
});

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
