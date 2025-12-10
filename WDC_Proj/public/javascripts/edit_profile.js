new Vue({
    el: '#signup-body',
    data: {
        profile: {
            display_name: '',
            username: '',
            email: '',
            password: '',
            confirm_password: '',
            phone_number: '',
            user_image: null,
            google_account: 0
        },
        isPopupVisible: false,
        orgToLeave: null,
        isConfirmLeaveVisible: false,
        isDeletePopupVisible: false,
        deletePassword: '',
        editProfilePassword: '',
        isSensitiveFieldPopupVisible: false,
        uploadedImage: null,
        organizations: [],
    },
    methods: {
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.profile.user_image = URL.createObjectURL(file); // For preview purposes
                this.uploadedImage = file; // Store the file for submission
            } else {
                alert('Please upload a valid image file.');
            }
        },
        saveProfile() {
            if (
                this.profile.display_name === '' &&
                this.profile.username === '' &&
                this.profile.email === '' &&
                this.profile.password === '' &&
                this.profile.confirm_password === '' &&
                this.profile.phone_number === '' &&
                this.profile.user_image === null &&
                this.profile.google_account === 0
            ){
                alert('There are no edits to save.');
            }else if (this.profile.password || this.profile.confirm_password || this.profile.username || this.profile.email) {
                // Show confirmation popup if sensitive fields are filled
                this.isSensitiveFieldPopupVisible = true;
            } else {
                // Proceed with saving profile
                this.submitProfile();
            }
        },
        submitProfile() { // Renamed from saveProfile to separate the submit logic
            const formData = new FormData();
            if (this.profile.display_name) formData.append('display_name', this.profile.display_name); // Not required
            if (this.profile.google_account === 0) {
                if (this.profile.username) formData.append('username', this.profile.username); // Not required
                if (this.profile.email) formData.append('email', this.profile.email); // Not required
                if (this.profile.password) formData.append('new_password', this.profile.password); // Not required
                if (this.profile.confirm_password) formData.append('confirm_password', this.profile.confirm_password); // Not required
                if (this.editProfilePassword) formData.append('password', this.editProfilePassword); // Required for sensitive changes
            }
            if (this.profile.phone_number) formData.append('phone_number', this.profile.phone_number); // Not required

            // Check if the image size is within the MEDIUMBLOB limit (16 MB)
            if (this.uploadedImage && this.uploadedImage.size <= 16 * 1024 * 1024) {
                formData.append('user_image', this.uploadedImage);
            } else if (this.uploadedImage) {
                alert('Please upload an image smaller than 16 MB.');
                return;
            }

            fetch('/users/edit_user', {
                method: 'PUT',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Profile updated successfully');
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        cancelEdit() {
            // Logic to cancel edit
            window.location.href = 'landing_page.html';
        },
        deleteProfile() {
            // Logic to delete profile
            alert('Profile deleted!');
        },
        openPopup() {
            this.isPopupVisible = true;
            // Logic to make router call and populate popup content
            this.fetchUserOrganizations();
        },
        closePopup() {
            this.isPopupVisible = false;
        },
        fetchUserInfo() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/users/get_user_info', true);
            xhr.responseType = 'json'; // Ensure the response is automatically parsed as JSON
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const userInfo = xhr.response;
                    this.profile.display_name = userInfo.display_name || '';
                    this.profile.username = userInfo.username || '';
                    this.profile.email = userInfo.email || '';
                    this.profile.phone_number = userInfo.phone_number || '';
                    this.profile.google_account = userInfo.google_account || 0;

                    if(userInfo.google_account){
                        this.profile.username = '';
                        this.profile.email = '';
                        this.profile.password = '';
                        this.profile.confirm_password = '';
                    }

                    if (userInfo.user_image) { // Log user_image property
                        if (userInfo.user_image.data) { // Log data property
                            const base64Image = this.arrayBufferToBase64(userInfo.user_image.data);
                            this.profile.user_image = base64Image;
                        } else {
                            console.log('User Image Data does not exist');
                            this.profile.user_image = '/images/allium_logo_transparent.png';
                        }
                    } else {
                        console.log('User Image does not exist');
                        this.profile.user_image = '/images/allium_logo_transparent.png'; // Default image if none is provided
                    }
                } else {
                    console.error("There was an error fetching the user info!");
                }
            };
            xhr.onerror = () => {
                console.error("There was an error fetching the user info!");
            };
            xhr.send();
        },
        arrayBufferToBase64(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return 'data:image/jpeg;base64,' + btoa(binary);
        },
        fetchUserOrganizations() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/users/get_user_organizations', true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    this.organizations = JSON.parse(xhr.responseText);
                } else {
                    console.error("There was an error fetching the organizations!");
                }
            };
            xhr.onerror = () => {
                console.error("There was an error fetching the organizations!");
            };
            xhr.send();
        },
        toggleReceiveEmails(orgId) {

            const newReceiveEmailsValue = !orgId.receive_emails;
            const organizationId = orgId.organization_id;

            console.log(newReceiveEmailsValue);

            console.log("Toggling receive_emails for Organization ID:", organizationId);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/users/toggle_receive_emails', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    this.fetchUserOrganizations();
                    // window.location.reload();
                } else {
                    console.error("There was an error toggling the receive emails setting!");
                }
            };
            xhr.onerror = () => {
                console.error("There was an error toggling the receive emails setting!");
            };
            xhr.send(JSON.stringify({ organization_id: organizationId, receive_emails: newReceiveEmailsValue }));
        },
        leaveOrganization(orgId) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/users/leave_organization', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Reload the page and open the popup again
                    window.location.reload();
                    this.isPopupVisible = true;
                } else {
                    console.error("There was an error leaving the organization!");
                }
            };
            xhr.onerror = () => {
                console.error("There was an error leaving the organization!");
            };
            xhr.send(JSON.stringify({ organization_id: orgId }));
        },
        confirmLeave(orgId) {
            this.orgToLeave = orgId;
            this.isConfirmLeaveVisible = true;
        },
        handleLeave() {
            this.leaveOrganization(this.orgToLeave);
            this.isConfirmLeaveVisible = false;
        },
        cancelLeave() {
            this.isConfirmLeaveVisible = false;
            this.orgToLeave = null;
        },
        openDeletePopup() {
            if(this.profile.google_account === 1){
                alert("This will permanently delete you account, are you sure?");

                fetch('users/delete_google', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/landing_page.html';
                    } else {
                        return response.json().then(error => {
                            console.error("Error:", error);
                            alert("An error occurred while deleting your account.");
                        });
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred while deleting your account.");
                });
            }else{
                this.isDeletePopupVisible = true;
            }
        },
        cancelDelete() {
            this.isDeletePopupVisible = false;
            this.deletePassword = '';
        },
        handleDelete() {
            if (this.deletePassword) {
                this.deleteAccount(this.deletePassword);
            } else {
                alert("Password is required to delete the account.");
            }
        },
        deleteAccount(password) {
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/users/delete', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Redirect to home or login page after successful deletion
                    window.location.href = '/';
                } else {
                    alert("Failed to delete account. Please check your password and try again.");
                }
            };
            xhr.onerror = () => {
                console.error("There was an error deleting the account!");
            };
            xhr.send(JSON.stringify({ password: password }));
        }
    },
    created() {
        this.fetchUserInfo();
        this.fetchUserOrganizations();
    }
});