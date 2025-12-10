document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('id');

    let membersOnly = 0;

    function switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.toggle('active', tab.id === tabId);
        });
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    if (orgId) {
        fetch(`/managers/check_user_manager_status?organization_id=${orgId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                if (!data.is_manager) {
                    alert('You do not have permission to access this page.');
                    window.location.href = `organisation_page.html?id=${orgId}`;
                    return;
                }

                fetch(`/organizations/page_info?organization_id=${orgId}`)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data) {
                            document.getElementById('organization-name').textContent = data.name;

                            let base64ClubImage = null;

                            if (data.organization_image && data.organization_image.data) {
                                base64ClubImage = arrayBufferToBase64(data.organization_image.data);
                            }

                            document.getElementById('organization-image').src = base64ClubImage ? `data:image/jpeg;base64,${base64ClubImage}` : '/images/allium_logo.png';
                        } else {
                            alert('Organization not found');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching organization data:', error);
                    });

                fetch(`/managers/get_all_organization_events_and_updates?organization_id=${orgId}`)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(data => {
                        const eventList = document.getElementById('event-list');
                        eventList.innerHTML = '';
                        const uniqueEvents = {};
                        data.filter(item => item.type === 'event').forEach(event => {
                            if (!uniqueEvents[event.id]) {
                                const option = document.createElement('option');
                                option.text = event.title;
                                option.value = JSON.stringify(event);
                                eventList.add(option);
                                uniqueEvents[event.id] = true;
                            }
                        });

                        const updateList = document.getElementById('update-list');
                        updateList.innerHTML = '';
                        const uniqueUpdates = {};
                        data.filter(item => item.type === 'update').forEach(update => {
                            if (!uniqueUpdates[update.id]) {
                                const option = document.createElement('option');
                                option.text = update.title;
                                option.value = JSON.stringify(update);
                                updateList.add(option);
                                uniqueUpdates[update.id] = true;
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching events and updates:', error);
                    });

                fetch(`/managers/get_users_in_organization?organization_id=${orgId}`)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(data => {
                        const memberList = document.querySelector('.member-list');
                        memberList.innerHTML = '';
                        data.forEach(member => {
                            const option = document.createElement('option');
                            option.text = `${member.display_name} - ${member.email} - ${member.phone_number}`;
                            option.value = member.user_id;
                            memberList.add(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching members:', error);
                    });
            })
            .catch(error => {
                console.error('Error checking user permissions or manager status:', error);
            });
    } else {
        alert('No organization ID provided');
    }

    // Add event modal functionality
    const addEventModal = document.getElementById('add_event');
    const addEventButton = document.getElementById('event_add');
    const cancelEventButton = document.getElementById('event_cancel');
    const submitEventButton = document.getElementById('event_submit');

    addEventButton.onclick = function() {
        addEventModal.style.display = 'block';
    };

    cancelEventButton.onclick = function() {
        addEventModal.style.display = 'none';
    };

    document.getElementById('toggle-members').onchange = function() {
        membersOnly = this.checked ? 1 : 0;
        document.getElementById('toggle-label').textContent = this.checked ? 'Members' : 'Public';
    };

    submitEventButton.onclick = function() {
        const eventTitle = document.getElementById('title').value;
        const eventDescription = document.getElementById('description').value;
        const eventDate = document.getElementById('date').value;
        const eventLocation = document.getElementById('location')?.value;

        const newEvent = {
            title: eventTitle,
            description: eventDescription,
            date: eventDate,
            location: eventLocation,
            organization_id: orgId,
            members_only: membersOnly,
        };

        fetch(`/managers/add_organization_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Event added successfully');
                addEventModal.style.display = 'none';
                location.reload(); // Reload to show the new event
            } else {
                alert('Failed to add event');
            }
        })
        .catch(error => {
            console.error('Error adding event:', error);
        });
    };

    // Add update modal functionality
    const addUpdateModal = document.getElementById('add_update');
    const addUpdateButton = document.getElementById('update_add');
    const cancelUpdateButton = document.getElementById('update_cancel');
    const submitUpdateButton = document.getElementById('update_submit');

    addUpdateButton.onclick = function() {
        addUpdateModal.style.display = 'block';
    };

    cancelUpdateButton.onclick = function() {
        addUpdateModal.style.display = 'none';
    };

    document.getElementById('update_toggle-members').onchange = function() {
        membersOnly = this.checked ? 1 : 0;
        document.getElementById('update_toggle-label').textContent = this.checked ? 'Members' : 'Public';
    };

    submitUpdateButton.onclick = function() {
        const updateTitle = document.getElementById('update_title').value;
        const updateDescription = document.getElementById('update_description').value;
        const updateDate = document.getElementById('update_date').value;

        const newUpdate = {
            title: updateTitle,
            description: updateDescription,
            date: updateDate,
            organization_id: orgId,
            members_only: membersOnly,
        };

        fetch(`/managers/add_organization_update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUpdate)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Update added successfully');
                addUpdateModal.style.display = 'none';
                location.reload(); // Reload to show the new update
            } else {
                alert('Failed to add update');
            }
        })
        .catch(error => {
            console.error('Error adding update:', error);
        });
    };

    // View event details
    const viewEventButton = document.getElementById('event_view');
    viewEventButton.onclick = function() {
        const selectedEvent = document.getElementById('event-list').value;
        if (!selectedEvent) {
            alert('Please select an event.');
            return;
        }
        const eventObj = JSON.parse(selectedEvent);
        fetch(`/managers/get_event_details?organization_id=${orgId}&event_id=${eventObj.id}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    openEventModal(data);
                } else {
                    alert('Event not found');
                }
            })
            .catch(error => {
                console.error('Error fetching event details:', error);
            });
    };

    // View update details
    const viewUpdateButton = document.getElementById('update_view');
    viewUpdateButton.onclick = function() {
        const selectedUpdate = document.getElementById('update-list').value;
        if (!selectedUpdate) {
            alert('Please select an update.');
            return;
        }
        const updateObj = JSON.parse(selectedUpdate);
        fetch(`/managers/get_update_details?organization_id=${orgId}&update_id=${updateObj.id}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    openUpdateModal(data);
                    console.log(data);
                } else {
                    alert('Update not found');
                }
            })
            .catch(error => {
                console.error('Error fetching update details:', error);
            });
    };

    // View RSVPs
    const rsvpEventButton = document.getElementById('view_rsvp');
    rsvpEventButton.onclick = function() {
        const selectedEvent = document.getElementById('event-list').value;
        if (!selectedEvent) {
            alert('Please select an event.');
            return;
        }
        const eventObj = JSON.parse(selectedEvent);
        fetch(`/managers/get_event_attendance?event_id=${eventObj.id}&organization_id=${orgId}`)
            .then(response => response.json())
            .then(data => {
                const rsvpList = document.getElementById('rsvp-list-select');
                rsvpList.innerHTML = '';
                data.forEach(member => {
                    const option = document.createElement('option');
                    option.text = `${member.display_name} (${member.email}) - ${member.attendance ? 'Attending' : 'Not Attending'}`;
                    rsvpList.add(option);
                });
                openRSVPModal();
            })
            .catch(error => {
                console.error('Error fetching RSVPs:', error);
            });
    };

    // Edit event
    const editEventButton = document.getElementById('edit_event_button');
    editEventButton.onclick = function() {
        const selectedEvent = document.getElementById('event-list').value;
        if (!selectedEvent) {
            alert('Please select an event.');
            return;
        }
        const eventObj = JSON.parse(selectedEvent);
        fetch(`/managers/get_event_details?organization_id=${orgId}&event_id=${eventObj.id}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    openEditEventModal(data);
                } else {
                    alert('Event not found');
                }
            })
            .catch(error => {
                console.error('Error fetching event details:', error);
            });
    };

    // Save event
    const saveEventButton = document.getElementById('save_event');
    saveEventButton.onclick = function() {
        const eventId = document.getElementById('edit_event_id').value;
        const eventTitle = document.getElementById('edit_event_title').value;
        const eventDescription = document.getElementById('edit_event_description').value;
        const eventDate = document.getElementById('edit_event_date').value;
        const eventLocation = document.getElementById('edit_event_location').value;

        const updatedEvent = {
            event_id: eventId,
            title: eventTitle,
            description: eventDescription,
            date: eventDate,
            location: eventLocation,
        };

        fetch(`/managers/update_organization_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEvent)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Event updated successfully');
                location.reload(); // Reload the page to show the updated event
            } else {
                alert('Failed to update event');
            }
        })
        .catch(error => {
            console.error('Error updating event:', error);
        });
    };

    // Edit update
    const editUpdateButton = document.getElementById('edit_update_button');
    editUpdateButton.onclick = function() {
        const selectedUpdate = document.getElementById('update-list').value;
        if (!selectedUpdate) {
            alert('Please select an update.');
            return;
        }
        const updateObj = JSON.parse(selectedUpdate);
        fetch(`/managers/get_update_details?organization_id=${orgId}&update_id=${updateObj.id}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    openEditUpdateModal(data);
                } else {
                    alert('Update not found');
                }
            })
            .catch(error => {
                console.error('Error fetching update details:', error);
            });
    };

    // Save update
    const saveUpdateButton = document.getElementById('save_update');
    saveUpdateButton.onclick = function() {
        const updateId = document.getElementById('edit_update_id').value;
        const updateTitle = document.getElementById('edit_update_title').value;
        const updateDescription = document.getElementById('edit_update_description').value;
        const updateDate = document.getElementById('edit_update_date').value;

        const updatedUpdate = {
            update_id: updateId,
            title: updateTitle,
            description: updateDescription,
            date: updateDate,
        };

        fetch(`/managers/update_organization_update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUpdate)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Update updated successfully');
                location.reload(); // Reload the page to show the updated update
            } else {
                alert('Failed to update update');
            }
        })
        .catch(error => {
            console.error('Error updating update:', error);
        });
    };

    // Remove event
    const removeEventButton = document.getElementById('event_delete');
    removeEventButton.onclick = function() {
        const selectedEvent = document.getElementById('event-list').value;
        if (!selectedEvent) {
            alert('Please select an event to remove.');
            return;
        }
        const eventObj = JSON.parse(selectedEvent);

        fetch(`/managers/remove_organization_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event_id: eventObj.id })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Event removed successfully');
                location.reload(); // Reload to remove the event from the list
            } else {
                alert('Failed to remove event');
            }
        })
        .catch(error => {
            console.error('Error removing event:', error);
        });
    };

    // Remove update
    const removeUpdateButton = document.getElementById('update_delete');
    removeUpdateButton.onclick = function() {
        const selectedUpdate = document.getElementById('update-list').value;
        if (!selectedUpdate) {
            alert('Please select an update to remove.');
            return;
        }
        const updateObj = JSON.parse(selectedUpdate);

        fetch(`/managers/remove_organization_update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ update_id: updateObj.id })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Update removed successfully');
                location.reload(); // Reload to remove the update from the list
            } else {
                alert('Failed to remove update');
            }
        })
        .catch(error => {
            console.error('Error removing update:', error);
        });
    };

    // Remove member
    const removeMemberButton = document.querySelector('.member-remove');
    removeMemberButton.onclick = function() {
        const selectedMember = document.getElementById('member-list-select').value;
        if (!selectedMember) {
            alert('Please select a member to remove.');
            return;
        }

        fetch(`/managers/remove_user_from_organisation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: selectedMember, organization_id: orgId })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Member removed successfully');
                location.reload(); // Reload to remove the member from the list
            } else {
                alert('Failed to remove member');
            }
        })
        .catch(error => {
            console.error('Error removing member:', error);
        });
    };

    // Modal handling functions
    function openEventModal(event) {
        document.getElementById('event_id').value = event.event_id;
        document.getElementById('event_title').value = event.event_title;
        document.getElementById('event_description').value = event.description;
        document.getElementById('event_date').value = event.date;
        document.getElementById('event_location').value = event.location;
        document.getElementById('event_post_date').value = event.post_date;
        document.getElementById('event_members_only').value = event.members_only ? 'Yes' : 'No';
        document.getElementById('view_event_modal').style.display = 'block';
    }

    function closeEventModal() {
        document.getElementById('view_event_modal').style.display = 'none';
    }

    function openEditEventModal(event) {
        document.getElementById('edit_event_id').value = event.event_id;
        document.getElementById('edit_event_title').value = event.event_title;
        document.getElementById('edit_event_description').value = event.description;

        const formattedDate = new Date(event.date).toISOString().split('T')[0];
        document.getElementById('edit_event_date').value = formattedDate;

        document.getElementById('edit_event_location').value = event.location;
        document.getElementById('edit_event_members_only').value = event.members_only ? 'Yes' : 'No';
        document.getElementById('edit_event_modal').style.display = 'block';
        closeEventModal();
    }

    function closeEditEventModal() {
        document.getElementById('edit_event_modal').style.display = 'none';
    }

    function openUpdateModal(update) {
        document.getElementById('view_update_id').value = update.update_id;
        document.getElementById('view_update_title').value = update.update_title;
        document.getElementById('view_update_description').value = update.description;
        document.getElementById('view_update_date').value = update.date;
        document.getElementById('view_update_post_date').value = update.post_date;
        document.getElementById('view_update_members_only').value = update.members_only ? 'Yes' : 'No';
        document.getElementById('view_update_modal').style.display = 'block';
    }

    function closeUpdateModal() {
        document.getElementById('view_update_modal').style.display = 'none';
    }

    function openEditUpdateModal(update) {
        document.getElementById('edit_update_id').value = update.update_id;
        document.getElementById('edit_update_title').value = update.update_title;
        document.getElementById('edit_update_description').value = update.description;

        const formattedDate = new Date(update.date).toISOString().split('T')[0];
        document.getElementById('edit_update_date').value = formattedDate;

        document.getElementById('edit_update_modal').style.display = 'block';
        closeUpdateModal();
    }

    function closeEditUpdateModal() {
        document.getElementById('edit_update_modal').style.display = 'none';
    }

    function openRSVPModal() {
        document.getElementById('view_event_modal').style.display = 'none';
        document.getElementById('rsvp_modal').style.display = 'block';
    }

    function closeRSVPModal() {
        document.getElementById('rsvp_modal').style.display = 'none';
        document.getElementById('view_event_modal').style.display = 'block';
    }

    document.getElementById('close_event_modal').addEventListener('click', closeEventModal);
    document.getElementById('close_update_modal').addEventListener('click', closeUpdateModal);
    document.getElementById('back_to_event').addEventListener('click', closeRSVPModal);
    document.getElementById('cancel_event_edit').addEventListener('click', closeEditEventModal);
    document.getElementById('cancel_update_edit').addEventListener('click', closeEditUpdateModal);
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