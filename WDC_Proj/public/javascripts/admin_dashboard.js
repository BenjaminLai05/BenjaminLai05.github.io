new Vue({
  el: '#main-body',
  data: {
    users: [],
    organizations: [],
    managedOrganizations: [],
    viewUsersPopup: false,
    viewOrganizationsPopup: false,
    viewCreateOrgPopup: false,
    viewEditOrgPopup: false,
    viewManageOrgsPopup: false,
    viewGivePositionPopup: false,
    showEditPopup: false,

    editManagedOrgForm: {
      user_id: null,
      organization_id: null
    },
    assignPositionForm: {
      user_id: '',
      organization_id: ''
    },
    editUserForm: {
      userId: null,
      user_image: null,
      displayName: '',
      username: '',
      email: '',
      phoneNumber: '',
      permission: '',
      google_account: 0
    },
    newOrgForm: {
      name: '',
      organization_image: null,
      body0: '',
      email: '',
      social_link0: '',
      social_link1: '',
      body1: '',
      body2: '',
      social_link2: ''
    },
    editOrgForm: {
      organization_id: null,
      name: '',
      organization_image: null,
      body0: '',
      email: '',
      social_link0: '',
      social_link1: '',
      body1: '',
      body2: '',
      social_link2: ''
    },
    uploadedImage: null,
    userUploadedImage: null,
    isGoogleAccount: false
  },
  methods: {
    fetchUsers() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/admins/get_all_users', true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const users = JSON.parse(xhr.responseText);

          users.forEach(user => {
            if (user.user_image && user.user_image.data) {
              user.user_image = this.arrayBufferToBase64(user.user_image.data);
            }
          });

          this.users = users;
          this.viewUsersPopup = true;

        } else {
          console.error('Failed to fetch users');
        }
      };
      xhr.send();
    },
    openEditUsers() {
      this.fetchUsers();
    },
    closeEditUsers() {
      this.viewUsersPopup = false;
    },
    deleteUser(userId) {
      const userConfirmed = confirm("Are you sure you want to delete this user?");

      if (userConfirmed) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/admins/delete', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onload = () => {
          if (xhr.status === 200) {
            this.users = this.users.filter(user => user.user_id !== userId);
          } else {
            console.error('Failed to delete user');
          }
        };
        xhr.send(JSON.stringify({ user_id: userId }));
      }
    },
    showEditForm(user) {
      this.editUserForm.userId = user.user_id;
      this.editUserForm.displayName = user.display_name;
      this.editUserForm.username = user.username;
      this.editUserForm.user_image = user.user_image;
      this.editUserForm.email = user.email;
      this.editUserForm.phoneNumber = user.phone_number;
      this.editUserForm.permission = user.permission;
      this.isGoogleAccount = user.google_account === 1;
      this.showEditPopup = true;
    },
    closeEditForm() {
      this.showEditPopup = false;
    },
    confirmEdit() {
      const formData = new FormData();
      formData.append('userId', this.editUserForm.userId);
      formData.append('displayName', this.editUserForm.displayName);
      formData.append('username', this.editUserForm.username);
      formData.append('email', this.editUserForm.email);
      formData.append('phoneNumber', this.editUserForm.phoneNumber);
      formData.append('permission', this.editUserForm.permission);
      if (this.userUploadedImage) {
        formData.append('user_image', this.userUploadedImage);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', '/admins/edit_user', true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          this.closeEditForm();
          this.fetchUsers();
        } else {
          console.error('Failed to edit user');
        }
      };
      xhr.send(formData);
    },

    fetchOrganizations() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/admins/get_all_organizations', true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const organizations = JSON.parse(xhr.responseText);
          // Convert organization images to base64
          organizations.forEach(org => {
            if (org.organization_image && org.organization_image.data) {
              org.organization_image = this.arrayBufferToBase64(org.organization_image.data);
            }
          });
          this.organizations = organizations;
          this.viewOrganizationsPopup = true;
        } else {
          console.error('Failed to fetch organizations');
        }
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
    openManageOrganizations() {
      this.fetchOrganizations();
    },
    closeManageOrganizations() {
      this.viewOrganizationsPopup = false;
    },
    deleteOrganization(orgId) {
      const orgConfirmed = confirm("Are you sure you want to delete this organization?");
      if (orgConfirmed) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/admins/delete_organization', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onload = () => {
          if (xhr.status === 200) {
            // Refresh the list of organizations after deletion
            this.fetchOrganizations();
          } else {
            console.error('Failed to delete organization');
          }
        };
        xhr.send(JSON.stringify({ organization_id: orgId }));
      }
    },
    viewOrganizationPage(orgId) {
      window.location.href = `organizations/info/${orgId}`;
    },
    manageOrganizationPage(orgId) {
      window.location.href = `managers/manage/${orgId}`;
    },
    createNewOrg() {
      this.viewCreateOrgPopup = true;
    },
    closeCreateOrg() {
      this.viewCreateOrgPopup = false;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.newOrgForm.organization_image = URL.createObjectURL(file);
        this.uploadedImage = file;
      } else {
        alert('Please upload a valid image file.');
      }
    },
    handleUserFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.editUserForm.user_image = URL.createObjectURL(file);
        this.userUploadedImage = file;
      } else {
        alert('Please upload a valid image file.');
      }
    },
    submitNewOrganization() {
      const formData = new FormData();
      formData.append('name', this.newOrgForm.name);
      if (this.uploadedImage) {
        formData.append('organization_image', this.uploadedImage);
      }
      formData.append('body0', this.newOrgForm.body0);
      formData.append('email', this.newOrgForm.email);
      formData.append('social_link0', this.newOrgForm.social_link0);
      formData.append('social_link1', this.newOrgForm.social_link1);
      formData.append('body1', this.newOrgForm.body1);
      formData.append('body2', this.newOrgForm.body2);
      formData.append('social_link2', this.newOrgForm.social_link2);

      fetch('/admins/create_organization', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          this.closeCreateOrg();
          this.fetchOrganizations();
        } else {
          console.error('Failed to create organization');
        }
      })
      .catch(error => console.error('Error:', error));
    },
    showEditOrgForm(org) {
      this.editOrgForm = {
        organization_id: org.organization_id,
        name: org.name,
        organization_image: org.organization_image,
        body0: org.body0,
        email: org.email,
        social_link0: org.social_link0,
        social_link1: org.social_link1,
        body1: org.body1,
        body2: org.body2,
        social_link2: org.social_link2
      };
      this.viewEditOrgPopup = true;
    },

    closeEditOrg() {
      this.viewEditOrgPopup = false;
    },

    handleEditFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.editOrgForm.organization_image = URL.createObjectURL(file); // For preview purposes
        this.uploadedImage = file; // Store the file for submission
      } else {
        alert('Please upload a valid image file.');
      }
    },

    submitEditOrganization() {
      const formData = new FormData();
      formData.append('organization_id', this.editOrgForm.organization_id);
      formData.append('name', this.editOrgForm.name);
      if (this.uploadedImage) {
        formData.append('organization_image', this.uploadedImage);
      }
      formData.append('body0', this.editOrgForm.body0);
      formData.append('email', this.editOrgForm.email);
      formData.append('social_link0', this.editOrgForm.social_link0);
      formData.append('social_link1', this.editOrgForm.social_link1);
      formData.append('body1', this.editOrgForm.body1);
      formData.append('body2', this.editOrgForm.body2);
      formData.append('social_link2', this.editOrgForm.social_link2);

      fetch('/admins/edit_organization', {
        method: 'PUT',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          this.closeEditOrg();
          this.fetchOrganizations();
        } else {
          console.error('Failed to edit organization');
        }
      })
      .catch(error => console.error('Error:', error));
    },
    openManageOrgsPopup(user) {
      console.log(user.user_id);
      this.editManagedOrgForm.user_id = user.user_id;
      this.assignPositionForm.user_id = user.user_id;
      this.fetchOrganizationsStatus(user.user_id);
    },
    closeManageOrgsPopup() {
      this.viewManageOrgsPopup = false;
    },
    fetchOrganizationsStatus(user_id) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/admins/get_organizations_status?user_id=${user_id}`, true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const managedOrganizations = JSON.parse(xhr.responseText);
          // Convert organization images to base64
          managedOrganizations.forEach(org => {
            if (org.organization_image && org.organization_image.data) {
              org.organization_image = this.arrayBufferToBase64(org.organization_image.data);
            }
          });
          this.managedOrganizations = managedOrganizations;

          this.viewManageOrgsPopup = true;
        } else {
          console.error('Failed to fetch organizations status');
        }
      };
      xhr.send();
    },
    removePosition(organization_id){
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/admins/remove_manager', true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log('User removed as manager successfully');
          this.fetchOrganizationsStatus(this.editManagedOrgForm.user_id);
        } else {
          console.error('Failed to remove user as manager');
        }
      };
      xhr.send(JSON.stringify({
        user_id: this.editManagedOrgForm.user_id,
        organization_id: organization_id
      }));
    },
    openGivePosition() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/admins/get_all_organizations', true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const organizations = JSON.parse(xhr.responseText);
          // Convert organization images to base64
          organizations.forEach(org => {
            if (org.organization_image && org.organization_image.data) {
              org.organization_image = this.arrayBufferToBase64(org.organization_image.data);
            }
          });
          this.organizations = organizations;
          this.viewGivePositionPopup = true;
        } else {
          console.error('Failed to fetch organizations');
        }
      };
      xhr.send();
    },
    closeGivePosition() {
      this.viewGivePositionPopup = false;
    },
    assignManager(organization_id) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'admins/add_manager', true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log('User added as manager successfully');
          this.closeGivePosition();
          this.fetchOrganizationsStatus(this.editManagedOrgForm.user_id);
        } else {
          console.error('Failed to add user as manager');
        }
      };
      xhr.send(JSON.stringify({
        user_id: this.editManagedOrgForm.user_id,
        organization_id: organization_id
      }));
    }
  },
  created() {

  }
});