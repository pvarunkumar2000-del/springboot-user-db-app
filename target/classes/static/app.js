// Nexis App Controller

const API_BASE = '/api/users';
let usersState = [];
let isEditing = false;

// DOM Elements
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const userAgeInput = document.getElementById('user-age');
const userRoleInput = document.getElementById('user-role');

const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const submitBtn = document.getElementById('submit-btn');
const submitBtnText = submitBtn.querySelector('.btn-text');
const submitBtnSpinner = submitBtn.querySelector('.btn-spinner');
const cancelBtn = document.getElementById('cancel-btn');

const searchInput = document.getElementById('search-input');
const cardsContainer = document.getElementById('cards-container');
const loadingIndicator = document.getElementById('loading-indicator');
const emptyState = document.getElementById('empty-state');
const toastContainer = document.getElementById('toast-container');

// Dashboard Stats Elements
const statTotalUsers = document.getElementById('stat-total-users');
const statAvgAge = document.getElementById('stat-avg-age');
const statTopRole = document.getElementById('stat-top-role');

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
userForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', filterUsers);

// Setup inputs for real-time error removal
[userNameInput, userEmailInput, userAgeInput, userRoleInput].forEach(input => {
    input.addEventListener('input', () => {
        removeFieldError(input);
    });
});

// Initialize Application
function init() {
    fetchUsers();
}

// Fetch users from API
async function fetchUsers() {
    showLoading(true);
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        usersState = await response.json();
        renderUsers(usersState);
        updateStats(usersState);
    } catch (error) {
        console.error('Could not fetch users:', error);
        showToast('Failed to load database records. Make sure the backend is running.', 'error');
    } finally {
        showLoading(false);
    }
}

// Render user cards
function renderUsers(usersList) {
    cardsContainer.innerHTML = '';
    
    if (usersList.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    usersList.forEach(user => {
        const card = createUserCard(user);
        cardsContainer.appendChild(card);
    });
}

// Create individual user card DOM element
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.setAttribute('data-id', user.id);
    
    // Get Initials
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
        
    // Avatar class based on ID to persist styling
    const gradIndex = user.id % 5;
    
    // Formatted date
    const dateFormatted = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    card.innerHTML = `
        <div class="card-top">
            <div class="user-avatar avatar-grad-${gradIndex}">${initials}</div>
            <div class="user-meta">
                <h4 class="user-name" title="${escapeHtml(user.name)}">${escapeHtml(user.name)}</h4>
                <span class="user-role" title="${escapeHtml(user.role)}">${escapeHtml(user.role)}</span>
            </div>
        </div>
        <div class="card-details">
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>${escapeHtml(user.email)}</span>
            </div>
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <span>Age ${user.age}</span>
            </div>
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Joined ${dateFormatted}</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="action-btn btn-edit" title="Edit User">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="action-btn btn-delete" title="Delete User">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
            </button>
        </div>
    `;
    
    // Bind Action Buttons
    card.querySelector('.btn-edit').addEventListener('click', () => editUser(user));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteUser(user.id));
    
    return card;
}

// Update statistics counters on UI
function updateStats(usersList) {
    // 1. Total Users
    statTotalUsers.textContent = usersList.length;
    
    // 2. Average Age
    if (usersList.length === 0) {
        statAvgAge.textContent = '0';
        statTopRole.textContent = 'N/A';
        return;
    }
    
    const sumAge = usersList.reduce((acc, u) => acc + u.age, 0);
    const avg = (sumAge / usersList.length).toFixed(1);
    statAvgAge.textContent = avg;
    
    // 3. Top Role
    const rolesMap = {};
    usersList.forEach(u => {
        const role = u.role.trim();
        rolesMap[role] = (rolesMap[role] || 0) + 1;
    });
    
    let topRole = 'N/A';
    let maxCount = 0;
    for (const [role, count] of Object.entries(rolesMap)) {
        if (count > maxCount) {
            maxCount = count;
            topRole = role;
        }
    }
    statTopRole.textContent = topRole.length > 15 ? topRole.substring(0, 15) + '...' : topRole;
}

// Search filter implementation
function filterUsers() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderUsers(usersState);
        return;
    }
    
    const filtered = usersState.filter(u => {
        return u.name.toLowerCase().includes(query) ||
               u.email.toLowerCase().includes(query) ||
               u.role.toLowerCase().includes(query);
    });
    
    renderUsers(filtered);
}

// Form Submission (Add or Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (submitBtn.disabled) return;
    
    // Clean prior validation errors
    clearAllErrors();
    
    // Client-side validations
    let isValid = true;
    
    const name = userNameInput.value.trim();
    const email = userEmailInput.value.trim();
    const ageVal = userAgeInput.value.trim();
    const role = userRoleInput.value.trim();
    
    if (!name) {
        setFieldError(userNameInput, 'Name is required');
        isValid = false;
    } else if (name.length < 2 || name.length > 100) {
        setFieldError(userNameInput, 'Name must be between 2 and 100 characters');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        setFieldError(userEmailInput, 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        setFieldError(userEmailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!ageVal) {
        setFieldError(userAgeInput, 'Required');
        isValid = false;
    } else {
        const age = parseInt(ageVal, 10);
        if (isNaN(age) || age < 18 || age > 120) {
            setFieldError(userAgeInput, 'Must be 18 - 120');
            isValid = false;
        }
    }
    
    if (!role) {
        setFieldError(userRoleInput, 'Role is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const payload = {
        name,
        email,
        age: parseInt(ageVal, 10),
        role
    };
    
    const editId = userIdInput.value;
    const isEditMode = !!editId;
    
    setSubmitting(true);
    
    try {
        const url = isEditMode ? `${API_BASE}/${editId}` : API_BASE;
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(isEditMode ? 'User records updated successfully!' : 'New user registered successfully!', 'success');
            resetForm();
            fetchUsers();
        } else {
            // Backend validation errors mapping
            if (response.status === 400 && data) {
                // Object mapping where fields match error messages
                Object.keys(data).forEach(field => {
                    const inputElement = document.getElementById(`user-${field}`);
                    if (inputElement) {
                        setFieldError(inputElement, data[field]);
                    }
                });
                showToast('Failed to validate. Please check highlighted fields.', 'error');
            } else {
                showToast(data.message || 'An error occurred while saving the user.', 'error');
            }
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Network error, could not contact database API.', 'error');
    } finally {
        setSubmitting(false);
    }
}

// Edit Mode Activation
function editUser(user) {
    isEditing = true;
    clearAllErrors();
    
    userIdInput.value = user.id;
    userNameInput.value = user.name;
    userEmailInput.value = user.email;
    userAgeInput.value = user.age;
    userRoleInput.value = user.role;
    
    formTitle.textContent = 'Edit User Record';
    formSubtitle.textContent = `Modifying DB entry for user ID #${user.id}.`;
    submitBtnText.textContent = 'Update Record';
    cancelBtn.classList.remove('hidden');
    
    // Smooth scroll to form on mobile devices
    userForm.scrollIntoView({ behavior: 'smooth' });
    userNameInput.focus();
}

// Delete Request
async function deleteUser(id) {
    if (!confirm('Are you sure you want to permanently delete this user from the database?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('User record deleted successfully.', 'success');
            // If deleting the user currently being edited, reset form
            if (userIdInput.value === id.toString()) {
                resetForm();
            }
            fetchUsers();
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to delete record.', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Network error, could not delete record.', 'error');
    }
}

// Form Reset Utility
function resetForm() {
    userForm.reset();
    userIdInput.value = '';
    isEditing = false;
    clearAllErrors();
    
    formTitle.textContent = 'Register New User';
    formSubtitle.textContent = 'Enter details to store in the persistent database.';
    submitBtnText.textContent = 'Save User';
    cancelBtn.classList.add('hidden');
}

// Error UI helpers
function setFieldError(inputElement, message) {
    inputElement.classList.add('invalid');
    const fieldId = inputElement.id.replace('user-', 'err-');
    const errSpan = document.getElementById(fieldId);
    if (errSpan) {
        errSpan.textContent = message;
        errSpan.classList.add('visible');
    }
}

function removeFieldError(inputElement) {
    inputElement.classList.remove('invalid');
    const fieldId = inputElement.id.replace('user-', 'err-');
    const errSpan = document.getElementById(fieldId);
    if (errSpan) {
        errSpan.textContent = '';
        errSpan.classList.remove('visible');
    }
}

function clearAllErrors() {
    [userNameInput, userEmailInput, userAgeInput, userRoleInput].forEach(removeFieldError);
}

// Loading States UI
function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        cardsContainer.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        cardsContainer.classList.remove('hidden');
    }
}

function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
        submitBtnSpinner.classList.remove('hidden');
        submitBtnText.style.opacity = '0.7';
    } else {
        submitBtnSpinner.classList.add('hidden');
        submitBtnText.style.opacity = '1';
    }
}

// Toast Notifications System
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;
    } else if (type === 'error') {
        iconSvg = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        `;
    } else {
        iconSvg = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        `;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3500);
}

// Prevent HTML injections
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
