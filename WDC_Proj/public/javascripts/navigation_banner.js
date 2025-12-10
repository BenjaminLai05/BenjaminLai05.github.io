// Function to fetch permission level from the server and update page HTML
function updatePageBasedOnPermissionLevel() {
    fetch('/get_user_permission_level')
        .then(response => response.json())
        .then(data => {
            const permissionLevel = data.permissionLevel;

            // console.log(permissionLevel);

            var profile = document.getElementById("dropdown-profile");
            var links = document.getElementById("dropdown-important-links");
            var userOrgs = document.getElementById("user-clubs");
            var managerOrgs = document.getElementById("manager-clubs");

            profile.innerHTML = `<div class="loading-indicator" style="color: #fff;">Loading...</div>`;
            links.innerHTML = `<div class="loading-indicator" style="color: #fff;">Loading...</div>`;
            userOrgs.innerHTML = `<div class="loading-indicator" style="color: #fff;">Loading...</div>`;
            managerOrgs.innerHTML = `<div class="loading-indicator" style="color: #fff;">Loading...</div>`;

            // Use permission level to customize client-side behavior
            if (permissionLevel === 0) {
                loadPermissionGuest(profile, links, userOrgs, managerOrgs);
            } else if (permissionLevel === 1) {
                loadPermissionUser(profile, links, userOrgs, managerOrgs);
            } else if (permissionLevel === 2) {
                loadPermissionManager(profile, links, userOrgs, managerOrgs);
            } else if (permissionLevel === 3) {
                loadPermissionAdmin(profile, links, userOrgs, managerOrgs);
            } else {
                console.log("Load Error");
            }
        })
        .catch(error => {
            console.error('Error fetching permission level:', error);
        });

    console.log("Divs updated...");

}

function addLogOut() {
    document.getElementById("log-out").addEventListener("click", function(event) {
        event.preventDefault();
        // console.log("Log out clicked");

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/log-out", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // console.log("Logout successful");
                    window.location.href = '/landing_page.html';
                } else {
                    console.error("Logout failed:", xhr.responseText);
                }
            }
        };
        xhr.send();
    });
}

function loadPermissionGuest(profile, links, userOrgs, managerOrgs){
    profile.innerHTML = `
    <div class="dropdown-profile-guest-wrapper">
        <div class="dropdown-profile-guest-wrapper2">
            <a href="landing_page.html">
            <img src="/images/allium_logo.png" alt="temp" class="dropdown-profile-guest-image">
            </a>
            <div class="dropdown-profile-guest-wrapper1">
                <p style="white-space: normal; padding-bottom: 2.5px;">You are currently a,</p>
                <h2 class="dropdown-profile-guest-name">Visitor</h2>
            </div>
        </div>
        <p style="white-space: normal;">You can Log in or Sign up for more options...</p>
    </div>
    `;

    links.innerHTML = `
        <a href="signin.html" class="dropdown-link link">Log in</a><br>
        <a href="signup.html" class="dropdown-link link">Sign up</a><br>
    `;
}


function loadPermissionUser(profile, links, userOrgs, managerOrgs){
    profile.innerHTML = `
    <div class="dropdown-profile-guest-wrapper">
        <div class="dropdown-profile-guest-wrapper2">
            <img src="/images/allium_logo.png" alt="temp" class="dropdown-profile-guest-image">
            <div class="dropdown-profile-guest-wrapper1">
                <p style="white-space: normal; padding-bottom: 2.5px;">You are signed in as,</p>
                <div class="loading-indicator" style="color: #fff; ">Loading...</div>
            </div>
        </div>
        <div class="loading-indicator" style="color: #fff; ">Loading...</div>
    </div>
    `;

    links.innerHTML = `
        <a href="edit_profile.html" class="dropdown-link link" id="my-account">My Account</a><br>
        <a href="#" class="dropdown-link link" id="log-out">Log out</a><br>
    `;

    fetch('/users/get_name')
    .then(response => response.json())
    .then(data => {
        if (data.display_name) {
            profile.innerHTML = `
            <div class="dropdown-profile-guest-wrapper">
                <div class="dropdown-profile-guest-wrapper2">
                <a href="edit_profile.html">
                    <img src="/images/allium_logo.png" alt="temp" class="dropdown-profile-guest-image">
                </a>
                    <div class="dropdown-profile-guest-wrapper1">
                        <p style="white-space: normal; padding-bottom: 2.5px;">You are signed in as,</p>
                        <h2 class="dropdown-profile-guest-name">${data.display_name}</h2>
                    </div>
                </div>
                <p style="white-space: normal;">Welcome! <br> Feel free to explore the site using the options below...</p>
            </div>
            `;
        }
        console.log(data.user_image);
        if (data.user_image && data.user_image.data) {

            console.log('User image data found:', data.user_image.data); // Log image data

            const base64Image = arrayBufferToBase64(data.user_image.data);

            profile.innerHTML = `
            <div class="dropdown-profile-guest-wrapper">
                <div class="dropdown-profile-guest-wrapper2">
                    <a href="edit_profile.html">
                        <img src="data:image/jpeg;base64,${base64Image}" alt="temp" class="dropdown-profile-guest-image">
                    </a>
                    <div class="dropdown-profile-guest-wrapper1">
                        <p style="white-space: normal; padding-bottom: 2.5px;">You are signed in as,</p>
                        <h2 class="dropdown-profile-guest-name">${data.display_name}</h2>
                    </div>
                </div>
                <p style="white-space: normal;">Welcome! <br> Feel free to explore the site using the options below...</p>
            </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error fetching user info', error);
    });
    addLogOut();

    //Adding my clubs
    const dropdownDiv = document.getElementById("dropdown-menu");
    const hr = document.createElement('hr');
    dropdownDiv.insertBefore(hr, userOrgs);

    userOrgs.classList.remove('true-hidden');

    userOrgs.innerHTML = `
        <div class="dropdown-myclubs-wrapper">
            <p style="font-size: 20px;">My Organizations</p>
            </div>
            <div id="myclubs" class="myclubs-container hidden">
                <a href="#" class="link"><div class="club-container">
                    <div class="loading-indicator" style="color: #fff; font-size: 14px;">Loading...</div>
                </div></a>
            </div>
        <button id="show-all-myclubs" type="button" class="show-button show-all-hidden">Show all</button>
    `;

    loadUserClubs().then(() => {
        const content = document.getElementById('myclubs');
        const seeMoreButton = document.getElementById('show-all-myclubs');

        // Check if content overflows
        if (content.scrollHeight > content.clientHeight) {
            seeMoreButton.classList.remove('show-all-hidden'); // Display the button
        }

        seeMoreButton.addEventListener('click', function() {
            content.classList.toggle('hidden'); /* Toggle the 'hidden' class */
            if (content.classList.contains('hidden')) {
                seeMoreButton.textContent = 'Show all'; /* Update button text to 'Show all' when content is hidden */
            } else {
                seeMoreButton.textContent = 'Hide all'; /* Update button text to 'Hide all' when content is visible */
            }
        });
    }).catch(error => {
        console.error('Error loading user organizations', error);
    });
}


function loadPermissionManager(profile, links, userOrgs, managerOrgs){
    loadPermissionUser(profile, links, userOrgs, managerOrgs);

    //adding managerClub
    const dropdownDiv = document.getElementById("dropdown-menu");
    const hr = document.createElement('hr');
    dropdownDiv.insertBefore(hr, managerOrgs);

    managerOrgs.classList.remove('true-hidden');

    managerOrgs.innerHTML = `
    <div class="dropdown-managemyclubs-wrapper">
                <p style="font-size: 20px;">Manage Organizations</p>
            </div>
            <div id="managemyclubs" class="myclubs-container hidden">
                <a href="#" class="link"><div class="club-container">
                    <div class="loading-indicator" style="color: #fff; font-size: 14px;">Loading...</div>
                </div></a>
            </div>
    <button id="show-all-managemyclubs" type="button" class="show-button show-all-hidden">Show all</button>
    `;

    loadManagerClubs().then(() => {
        const content = document.getElementById('managemyclubs');
        const seeMoreButton = document.getElementById('show-all-managemyclubs');

        // Check if content overflows
        if (content.scrollHeight > content.clientHeight) {
            seeMoreButton.classList.remove('show-all-hidden'); // Display the button
        }

        seeMoreButton.addEventListener('click', function() {
            content.classList.toggle('hidden'); /* Toggle the 'hidden' class */
            if (content.classList.contains('hidden')) {
                seeMoreButton.textContent = 'Show all'; /* Update button text to 'Show all' when content is hidden */
            } else {
                seeMoreButton.textContent = 'Hide all'; /* Update button text to 'Hide all' when content is visible */
            }
        });
    }).catch(error => {
        console.error('Error loading managed organizations', error);
    });
}

function loadPermissionAdmin(profile, links, userOrgs, managerOrgs){
    loadPermissionManager(profile, links, userOrgs, managerOrgs);

    const dropdownDiv = document.getElementById("dropdown-important-links");

    const hr = document.createElement('hr');

    const adminLink = document.createElement('a');
    adminLink.href = 'admin_dashboard.html';
    adminLink.className = 'dropdown-link link';


    adminLink.textContent = 'Admin Dashboard';
    dropdownDiv.appendChild(adminLink);
}

function loadUserClubs() {
    return new Promise((resolve, reject) => {
        fetch('/users/get_user_organizations')
            .then(response => response.json())
            .then(data => {
                const myClubsContainer = document.getElementById('myclubs');
                myClubsContainer.innerHTML = '';

                if (data.length === 0) {
                    const noClubsMessage = document.createElement('div');
                    noClubsMessage.className = 'no-clubs-message';
                    noClubsMessage.innerHTML = `
                        <p style="font-size: 14px;">You are not currently apart of any organization</p>
                    `;
                    myClubsContainer.appendChild(noClubsMessage);
                    resolve(); // Resolve the promise after updating the DOM with the custom message
                    return;
                }

                data.forEach(organization => {
                    const clubLink = document.createElement('a');
                    clubLink.href = `/organizations/info/${organization.organization_id}`;
                    clubLink.className = 'link';

                    const clubContainer = document.createElement('div');
                    clubContainer.className = 'club-container';

                    const clubImage = document.createElement('img');
                    clubImage.src = organization.organization_image || '/images/allium_logo.png';
                    clubImage.alt = organization.name;
                    clubImage.className = 'club-container-img';

                    const clubName = document.createElement('p');
                    clubName.textContent = organization.name;

                    clubContainer.appendChild(clubImage);
                    clubContainer.appendChild(clubName);
                    clubLink.appendChild(clubContainer);
                    myClubsContainer.appendChild(clubLink);
                });

                resolve(); // Resolve the promise after successfully updating the DOM
            })
            .catch(error => {
                console.error('Error getting users organizations', error);
                const myClubsContainer = document.getElementById('myclubs');
                myClubsContainer.innerHTML = '<p>There was an error loading your organizations.<br>Please try again later.</p>';
                reject(error); // Reject the promise if there's an error
            });
    });
}

function loadManagerClubs(){
    return new Promise((resolve, reject) => {
        fetch('/managers/get_all_managed_organizations')
            .then(response => response.json())
            .then(data => {
                const myClubsContainer = document.getElementById('managemyclubs');
                myClubsContainer.innerHTML = '';

                if (data.length === 0) {
                    const noClubsMessage = document.createElement('div');
                    noClubsMessage.className = 'no-clubs-message';
                    noClubsMessage.innerHTML = `
                        <p style="font-size: 14px;">You are not managing any organizations</p>
                    `;
                    myClubsContainer.appendChild(noClubsMessage);
                    resolve(); // Resolve the promise after updating the DOM with the custom message
                    return;
                }

                data.forEach(organization => {
                    const clubLink = document.createElement('a');
                    clubLink.href = `/managers/manage/${organization.organization_id}`;
                    clubLink.className = 'link';

                    const clubContainer = document.createElement('div');
                    clubContainer.className = 'club-container';

                    let base64Image = null;

                    if (organization.organization_image && organization.organization_image.data) {
                        base64Image = arrayBufferToBase64(organization.organization_image.data);
                    }

                    const clubImage = document.createElement('img');
                    clubImage.src = base64Image ? `data:image/jpeg;base64,${base64Image}` : '/images/allium_logo.png';
                    clubImage.alt = organization.name;
                    clubImage.className = 'club-container-img';

                    const clubName = document.createElement('p');
                    clubName.textContent = organization.name;

                    clubContainer.appendChild(clubImage);
                    clubContainer.appendChild(clubName);
                    clubLink.appendChild(clubContainer);
                    myClubsContainer.appendChild(clubLink);
                });

                resolve(); // Resolve the promise after successfully updating the DOM
            })
            .catch(error => {
                console.error('Error getting managed organizations', error);
                const myClubsContainer = document.getElementById('managemyclubs');
                myClubsContainer.innerHTML = '<p>There was an error loading your organizations.<br>Please try again later.</p>';
                reject(error); // Reject the promise if there's an error
            });
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

document.addEventListener("DOMContentLoaded", function() {
  const dropdownIcon = document.querySelector('.dropdown-icon');
  const navIcon = document.querySelectorAll('.nav_icon');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  // Add click event listener to the dropdown icon
  dropdownIcon.addEventListener('click', function() {
      // Toggle the visibility of the dropdown menu
      dropdownMenu.classList.toggle('show');
      navIcon.forEach(icon => icon.classList.toggle('clicked'));
  });
});

document.addEventListener('DOMContentLoaded', function () {
    const stickyElement = document.querySelector('.banner');
    const elementsToHide = document.querySelectorAll('.hide-me');
    const marker = document.querySelector('.marker1, .marker');

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) {
                stickyElement.classList.add('banner-small');
                elementsToHide.forEach(el => el.classList.add('hidden1'));
            } else {
                stickyElement.classList.remove('banner-small');
                elementsToHide.forEach(el => el.classList.remove('hidden1'));
            }
        },
        { threshold: [0] }
    );

    observer.observe(marker);
});

document.addEventListener('DOMContentLoaded', function () {
    const orgName = document.querySelector('.shrink-me');
    const marker = document.querySelector('.marker1, .marker');
    const navIcon = document.querySelectorAll('.nav_icon');

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) {
                orgName.classList.add('organization-name-shrunk');
                navIcon.forEach(ni => ni.classList.add('nav_icon_shrunk'));
            } else {
                orgName.classList.remove('organization-name-shrunk');
                navIcon.forEach(ni => ni.classList.remove('nav_icon_shrunk'));
            }
        },
        { threshold: [0] }
    );

    observer.observe(marker);
});
