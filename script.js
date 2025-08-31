// Safari compatibility and feature detection
(function() {
    'use strict';
    
    // Detect Safari browser
    window.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Safari localStorage test
    function isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    window.hasLocalStorage = isLocalStorageAvailable();
    
    // Feature detection for input types
    function supportsInputType(type) {
        const input = document.createElement('input');
        input.type = type;
        return input.type === type;
    }
    
    window.supportsDateInput = supportsInputType('date');
    window.supportsTimeInput = supportsInputType('time');
    
    // Notification support check
    window.hasNotificationSupport = 'Notification' in window && 
        typeof Notification.requestPermission === 'function';
    
})();

// Safari compatibility polyfills
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

class SleepTracker {
    constructor() {
        // User authentication state
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        
        // Data storage
        this.sleepData = [];
        this.settings = {
            sleepGoal: 8,
            bedtimeReminder: '22:00',
            enableNotifications: false
        };
        this.currentQuality = 3;
        
        // Authentication UI elements
        this.loginModal = document.getElementById('login-modal');
        this.loginBtn = document.getElementById('login-btn');
        this.userProfile = document.getElementById('user-profile');
        
        this.init();
    }

    // Safe localStorage access for Safari private mode
    safeGetLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    safeSetLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    init() {
        this.setupEventListeners();
        this.setupAuthListeners();
        this.updateCurrentDate();
        this.setTodayAsDefault();
        
        // Setup online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Show Safari compatibility info
        if (window.isSafari) {
            console.log('🌙 Web app tối ưu cho Safari đã được kích hoạt!');
            if (!window.hasLocalStorage) {
                this.showAlert('Lưu ý: Safari Private Mode có thể không lưu được dữ liệu.', 'warning');
            }
        }
    }
    
    showAlert(message, type = 'info') {
        // Create a custom alert notification
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${this.getAlertIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Style the alert
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#43e97b',
            error: '#ff6b6b',
            warning: '#ffa502',
            info: '#667eea'
        };
        alertDiv.style.background = colors[type] || colors.info;

        document.body.appendChild(alertDiv);

        // Auto remove after 3 seconds
        setTimeout(() => {
            alertDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }, 3000);

        // Also log for debugging
        if (type === 'warning' || type === 'error') {
            console.warn(message);
        } else {
            console.log(message);
        }
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Sleep form
        document.getElementById('sleep-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSleepRecord();
        });

        // Quality rating
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectQuality(parseInt(e.target.dataset.rating));
            });
        });

        // History filter
        document.getElementById('history-filter').addEventListener('change', () => {
            this.loadHistory();
        });
    }

    setupAuthListeners() {
        // Firebase auth state listener
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateUIForUser();
            
            if (user) {
                this.loadUserData();
            } else {
                this.loadGuestData();
            }
        });

        // Login modal controls
        this.loginBtn.addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('close-login-modal').addEventListener('click', () => {
            this.hideLoginModal();
        });

        // Click outside modal to close
        this.loginModal.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.hideLoginModal();
            }
        });

        // Auth tabs
        document.getElementById('login-tab').addEventListener('click', () => {
            this.switchAuthTab('login');
        });

        document.getElementById('register-tab').addEventListener('click', () => {
            this.switchAuthTab('register');
        });

        // Google login
        document.getElementById('google-login').addEventListener('click', () => {
            this.signInWithGoogle();
        });

        // Email auth form
        document.getElementById('email-auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailAuth();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.signOut();
        });
    }

    // Authentication Methods
    showLoginModal() {
        this.loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideLoginModal() {
        this.loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetAuthForm();
    }

    switchAuthTab(type) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const registerFields = document.getElementById('register-fields');
        const submitText = document.getElementById('auth-submit-text');

        if (type === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            registerFields.style.display = 'none';
            submitText.textContent = 'Đăng nhập';
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerFields.style.display = 'block';
            submitText.textContent = 'Đăng ký';
        }
    }

    async signInWithGoogle() {
        try {
            this.showAuthLoading(true);
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            await auth.signInWithPopup(provider);
            this.hideLoginModal();
            this.showAlert('Đăng nhập thành công!', 'success');
        } catch (error) {
            console.error('Google login error:', error);
            this.showAlert('Lỗi đăng nhập: ' + error.message, 'error');
        } finally {
            this.showAuthLoading(false);
        }
    }

    async handleEmailAuth() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const isRegister = document.getElementById('register-tab').classList.contains('active');

        if (isRegister) {
            const confirmPassword = document.getElementById('auth-confirm-password').value;
            const displayName = document.getElementById('auth-display-name').value;

            if (password !== confirmPassword) {
                this.showAlert('Mật khẩu không khớp!', 'error');
                return;
            }

            if (password.length < 6) {
                this.showAlert('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }

            try {
                this.showAuthLoading(true);
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                if (displayName) {
                    await userCredential.user.updateProfile({
                        displayName: displayName
                    });
                }

                this.hideLoginModal();
                this.showAlert('Đăng ký thành công!', 'success');
            } catch (error) {
                console.error('Register error:', error);
                this.showAlert('Lỗi đăng ký: ' + this.getFirebaseErrorMessage(error), 'error');
            } finally {
                this.showAuthLoading(false);
            }
        } else {
            try {
                this.showAuthLoading(true);
                await auth.signInWithEmailAndPassword(email, password);
                this.hideLoginModal();
                this.showAlert('Đăng nhập thành công!', 'success');
            } catch (error) {
                console.error('Login error:', error);
                this.showAlert('Lỗi đăng nhập: ' + this.getFirebaseErrorMessage(error), 'error');
            } finally {
                this.showAuthLoading(false);
            }
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            this.showAlert('Đã đăng xuất!', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.showAlert('Lỗi đăng xuất: ' + error.message, 'error');
        }
    }

    getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'Email này đã được sử dụng';
            case 'auth/weak-password':
                return 'Mật khẩu quá yếu';
            case 'auth/user-not-found':
                return 'Không tìm thấy tài khoản';
            case 'auth/wrong-password':
                return 'Sai mật khẩu';
            case 'auth/invalid-email':
                return 'Email không hợp lệ';
            case 'auth/user-disabled':
                return 'Tài khoản đã bị vô hiệu hóa';
            case 'auth/too-many-requests':
                return 'Quá nhiều yêu cầu, vui lòng thử lại sau';
            default:
                return error.message;
        }
    }

    showAuthLoading(show) {
        const authOptions = document.querySelector('.auth-options');
        const authLoading = document.getElementById('auth-loading');
        
        if (show) {
            authOptions.style.display = 'none';
            authLoading.style.display = 'block';
        } else {
            authOptions.style.display = 'block';
            authLoading.style.display = 'none';
        }
    }

    resetAuthForm() {
        document.getElementById('email-auth-form').reset();
        this.switchAuthTab('login');
        this.showAuthLoading(false);
    }

    updateUIForUser() {
        if (this.currentUser) {
            // Show user profile
            this.loginBtn.style.display = 'none';
            this.userProfile.style.display = 'flex';
            
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            
            userAvatar.src = this.currentUser.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
            userName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
        } else {
            // Show login button
            this.loginBtn.style.display = 'flex';
            this.userProfile.style.display = 'none';
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('vi-VN', options);
    }

    setTodayAsDefault() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sleep-date').value = today;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Refresh data for specific tabs
        if (tabName === 'history') {
            this.loadHistory();
        } else if (tabName === 'stats') {
            this.loadStatistics();
        }
    }

    selectQuality(rating) {
        this.currentQuality = rating;
        document.getElementById('sleep-quality').value = rating;
        
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-rating="${rating}"]`).classList.add('selected');
    }

    async saveSleepRecord() {
        const date = document.getElementById('sleep-date').value;
        const bedtime = document.getElementById('bedtime').value;
        const wakeupTime = document.getElementById('wakeup-time').value;
        const quality = this.currentQuality;
        const notes = document.getElementById('sleep-notes').value;

        if (!date || !bedtime || !wakeupTime) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Calculate sleep duration
        const bedtimeDate = new Date(`${date}T${bedtime}`);
        const wakeupDate = new Date(`${date}T${wakeupTime}`);
        
        // If wake up time is earlier than bedtime, it means next day
        if (wakeupDate < bedtimeDate) {
            wakeupDate.setDate(wakeupDate.getDate() + 1);
        }

        const duration = (wakeupDate - bedtimeDate) / (1000 * 60 * 60); // in hours

        const sleepRecord = {
            id: Date.now().toString(),
            date,
            bedtime,
            wakeupTime,
            duration,
            quality,
            notes,
            createdAt: new Date().toISOString(),
            synced: false
        };

        // Check if record for this date already exists
        const existingIndex = this.sleepData.findIndex(record => record.date === date);
        if (existingIndex !== -1) {
            if (confirm('Đã có bản ghi cho ngày này. Bạn có muốn ghi đè không?')) {
                sleepRecord.id = this.sleepData[existingIndex].id; // Keep existing ID
                this.sleepData[existingIndex] = sleepRecord;
            } else {
                return;
            }
        } else {
            this.sleepData.push(sleepRecord);
        }

        // Sort by date (newest first)
        this.sleepData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Save to appropriate storage
        try {
            if (this.currentUser && this.isOnline) {
                await this.saveSleepRecordToFirestore(sleepRecord);
                sleepRecord.synced = true;
            } else {
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Error saving sleep record:', error);
            this.saveToLocalStorage(); // Fallback
        }

        this.resetForm();
        this.loadDashboard();
        this.loadHistory();
        this.loadStatistics();

        alert('Đã lưu bản ghi giấc ngủ thành công!');
    }

    async saveSleepRecordToFirestore(record) {
        if (!this.currentUser) return;

        const sleepRecordRef = db.collection('users').doc(this.currentUser.uid)
            .collection('sleepData').doc(record.id);

        const recordData = { ...record };
        delete recordData.synced; // Don't save sync status to Firestore

        await sleepRecordRef.set(recordData, { merge: true });
    }

    resetForm() {
        document.getElementById('sleep-form').reset();
        this.setTodayAsDefault();
        this.selectQuality(3);
    }

    loadDashboard() {
        const lastNight = this.getLastNightSleep();
        const weeklyAverage = this.getWeeklyAverage();
        const sleepGoal = this.settings.sleepGoal;

        document.getElementById('last-night-sleep').textContent = 
            lastNight ? this.formatDuration(lastNight.duration) : '--';
        
        document.getElementById('weekly-average').textContent = 
            this.formatDuration(weeklyAverage);
        
        document.getElementById('sleep-goal').textContent = 
            this.formatDuration(sleepGoal);
    }

    getLastNightSleep() {
        if (this.sleepData.length === 0) return null;
        return this.sleepData[0]; // Since data is sorted by date desc
    }

    getWeeklyAverage() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentData = this.sleepData.filter(record => 
            new Date(record.date) >= oneWeekAgo
        );

        if (recentData.length === 0) return 0;

        const totalHours = recentData.reduce((sum, record) => sum + record.duration, 0);
        return totalHours / recentData.length;
    }

    formatDuration(hours) {
        if (hours === 0) return '0h 0m';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }

    loadHistory() {
        const filter = document.getElementById('history-filter').value;
        const filteredData = this.getFilteredData(filter);
        const historyList = document.getElementById('sleep-history-list');

        if (filteredData.length === 0) {
            historyList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-bed"></i>
                    <h3>Chưa có dữ liệu</h3>
                    <p>Hãy bắt đầu ghi nhận giấc ngủ của bạn!</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = filteredData.map(record => `
            <div class="history-item">
                <div class="history-date">
                    ${this.formatDate(record.date)}
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <div class="history-detail-label">Giờ đi ngủ</div>
                        <div class="history-detail-value">${record.bedtime}</div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Giờ thức dậy</div>
                        <div class="history-detail-value">${record.wakeupTime}</div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Thời gian ngủ</div>
                        <div class="history-detail-value">${this.formatDuration(record.duration)}</div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Chất lượng</div>
                        <div class="history-detail-value">${this.getQualityEmoji(record.quality)}</div>
                    </div>
                </div>
                ${record.notes ? `<div class="history-notes">"${record.notes}"</div>` : ''}
            </div>
        `).join('');
    }

    getFilteredData(filter) {
        const now = new Date();
        let cutoffDate;

        switch (filter) {
            case 'week':
                cutoffDate = new Date();
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate = new Date();
                cutoffDate.setDate(now.getDate() - 30);
                break;
            default:
                return this.sleepData;
        }

        return this.sleepData.filter(record => 
            new Date(record.date) >= cutoffDate
        );
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('vi-VN', options);
    }

    getQualityEmoji(quality) {
        const emojis = ['', '😴', '😐', '😊', '😍', '🥰'];
        return emojis[quality] || '😐';
    }

    loadStatistics() {
        const totalNights = this.sleepData.length;
        const averageSleep = this.getOverallAverage();
        const averageQuality = this.getAverageQuality();

        document.getElementById('total-nights').textContent = totalNights;
        document.getElementById('average-sleep').textContent = this.formatDuration(averageSleep);
        document.getElementById('average-quality').textContent = 
            averageQuality > 0 ? `${averageQuality.toFixed(1)}/5 ${this.getQualityEmoji(Math.round(averageQuality))}` : '--';

        this.drawChart();
    }

    getOverallAverage() {
        if (this.sleepData.length === 0) return 0;
        const totalHours = this.sleepData.reduce((sum, record) => sum + record.duration, 0);
        return totalHours / this.sleepData.length;
    }

    getAverageQuality() {
        if (this.sleepData.length === 0) return 0;
        const totalQuality = this.sleepData.reduce((sum, record) => sum + record.quality, 0);
        return totalQuality / this.sleepData.length;
    }

    drawChart() {
        const canvas = document.getElementById('sleep-chart');
        const ctx = canvas.getContext('2d');
        const recentData = this.sleepData.slice(0, 7).reverse(); // Last 7 days

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (recentData.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Chưa có dữ liệu để hiển thị biểu đồ', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Find max value for scaling
        const maxHours = Math.max(...recentData.map(d => d.duration), this.settings.sleepGoal);
        const scale = chartHeight / (maxHours + 1);

        // Draw bars
        const barWidth = chartWidth / recentData.length;
        recentData.forEach((record, index) => {
            const x = padding + index * barWidth;
            const barHeight = record.duration * scale;
            const y = canvas.height - padding - barHeight;

            // Bar color based on goal
            ctx.fillStyle = record.duration >= this.settings.sleepGoal ? '#43e97b' : '#f5576c';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

            // Draw values
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.formatDuration(record.duration), x + barWidth / 2, y - 5);

            // Draw dates
            const date = new Date(record.date);
            ctx.fillText(date.getDate() + '/' + (date.getMonth() + 1), x + barWidth / 2, canvas.height - 10);
        });

        // Draw goal line
        const goalY = canvas.height - padding - (this.settings.sleepGoal * scale);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, goalY);
        ctx.lineTo(canvas.width - padding, goalY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Goal line label
        ctx.fillStyle = '#667eea';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Mục tiêu: ${this.formatDuration(this.settings.sleepGoal)}`, padding + 5, goalY - 5);
    }

    loadSettings() {
        document.getElementById('sleep-goal-setting').value = this.settings.sleepGoal;
        document.getElementById('bedtime-reminder').value = this.settings.bedtimeReminder;
        document.getElementById('enable-notifications').checked = this.settings.enableNotifications;
    }

    // Data Management Methods
    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Load user settings
            const settingsDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (settingsDoc.exists) {
                this.settings = { ...this.settings, ...settingsDoc.data().settings };
            }

            // Load sleep data
            const sleepQuery = await db.collection('users').doc(this.currentUser.uid)
                .collection('sleepData')
                .orderBy('date', 'desc')
                .get();

            this.sleepData = sleepQuery.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error loading user data:', error);
            this.loadGuestData(); // Fallback to local storage
        }

        this.loadDashboard();
        this.loadHistory();
        this.loadStatistics();
        this.loadSettings();
    }

    loadGuestData() {
        // Load from localStorage for guest users
        this.sleepData = this.safeGetLocalStorage('sleepData') || [];
        this.settings = this.safeGetLocalStorage('sleepSettings') || {
            sleepGoal: 8,
            bedtimeReminder: '22:00',
            enableNotifications: false
        };

        this.loadDashboard();
        this.loadHistory();
        this.loadStatistics();
        this.loadSettings();
    }

    async saveData() {
        if (this.currentUser && this.isOnline) {
            try {
                // Save to Firestore
                await this.saveToFirestore();
            } catch (error) {
                console.error('Error saving to Firestore:', error);
                this.saveToLocalStorage(); // Fallback
            }
        } else {
            // Save to localStorage
            this.saveToLocalStorage();
        }
    }

    async saveToFirestore() {
        if (!this.currentUser) return;

        const userDoc = db.collection('users').doc(this.currentUser.uid);
        
        // Save settings
        await userDoc.set({
            settings: this.settings,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Note: Sleep records are saved individually in saveSleepRecord method
    }

    saveToLocalStorage() {
        this.safeSetLocalStorage('sleepData', this.sleepData);
        this.safeSetLocalStorage('sleepSettings', this.settings);
    }

    async syncOfflineData() {
        if (!this.currentUser || !this.isOnline) return;

        try {
            // Get offline data from localStorage
            const localSleepData = this.safeGetLocalStorage('sleepData') || [];
            const localSettings = this.safeGetLocalStorage('sleepSettings');

            // Sync settings
            if (localSettings) {
                this.settings = { ...this.settings, ...localSettings };
                await this.saveToFirestore();
            }

            // Sync sleep data
            for (const record of localSleepData) {
                if (!record.synced) {
                    await this.saveSleepRecordToFirestore(record);
                }
            }

            // Clear local data after successful sync
            localStorage.removeItem('sleepData');
            localStorage.removeItem('sleepSettings');

            this.showAlert('Đã đồng bộ dữ liệu offline!', 'success');
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }
}

// Global functions for HTML onclick events
function quickSleep() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    document.getElementById('bedtime').value = timeString;
    document.getElementById('sleep-date').value = now.toISOString().split('T')[0];
    
    // Switch to log tab
    sleepTracker.switchTab('log');
    
    alert('Đã đặt thời gian đi ngủ là ' + timeString + '. Chúc bạn ngủ ngon! 🌙');
}

function quickWakeup() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    // Get yesterday's date if it's early morning
    const date = now.getHours() < 12 ? 
        new Date(now.getTime() - 24 * 60 * 60 * 1000) : 
        now;
    
    document.getElementById('wakeup-time').value = timeString;
    document.getElementById('sleep-date').value = date.toISOString().split('T')[0];
    
    // Switch to log tab
    sleepTracker.switchTab('log');
    
    alert('Đã đặt thời gian thức dậy là ' + timeString + '. Chào buổi sáng! ☀️');
}

function saveSettings() {
    const sleepGoal = parseFloat(document.getElementById('sleep-goal-setting').value);
    const bedtimeReminder = document.getElementById('bedtime-reminder').value;
    const enableNotifications = document.getElementById('enable-notifications').checked;

    sleepTracker.settings = {
        sleepGoal,
        bedtimeReminder,
        enableNotifications
    };

    sleepTracker.saveData();
    sleepTracker.loadDashboard();
    sleepTracker.loadStatistics();
    
    alert('Đã lưu cài đặt thành công!');
    
    // Set up notification if enabled - Safari compatible
    if (enableNotifications && window.hasNotificationSupport) {
        try {
            // Modern browsers (including Safari 14+)
            if (Notification.requestPermission().then) {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        console.log('Notifications enabled');
                    }
                });
            } else {
                // Legacy Safari
                Notification.requestPermission(function(permission) {
                    if (permission === 'granted') {
                        console.log('Notifications enabled');
                    }
                });
            }
        } catch (e) {
            console.warn('Notification setup failed:', e);
        }
    }
}

function clearAllData() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
        if (confirm('Thực sự chắc chắn? Tất cả lịch sử giấc ngủ sẽ bị mất!')) {
            localStorage.removeItem('sleepData');
            sleepTracker.sleepData = [];
            sleepTracker.loadDashboard();
            sleepTracker.loadHistory();
            sleepTracker.loadStatistics();
            alert('Đã xóa tất cả dữ liệu!');
        }
    }
}

// Initialize app when DOM is loaded
let sleepTracker;
let sleepSmartAdvisor;

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Sleep Tracker
    sleepTracker = new SleepTracker();
    sleepTracker.init();
    
    // Khởi tạo Smart Sleep Advisor sau khi Sleep Tracker sẵn sàng
    setTimeout(() => {
        if (window.sleepSmartAdvisor) {
            sleepSmartAdvisor = window.sleepSmartAdvisor;
            // Đồng bộ dữ liệu với Sleep Tracker
            sleepSmartAdvisor.sleepData = sleepTracker.sleepData;
            sleepSmartAdvisor.settings = sleepTracker.settings;
        }
    }, 100);
    
    // Override saveData để cập nhật Smart Advisor
    const originalSaveData = sleepTracker.saveData;
    sleepTracker.saveData = function() {
        originalSaveData.call(this);
        // Cập nhật dữ liệu cho Smart Advisor
        if (sleepSmartAdvisor) {
            sleepSmartAdvisor.sleepData = this.sleepData;
            sleepSmartAdvisor.settings = this.settings;
        }
    };
    
    // Set up bedtime reminders
    setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        if (sleepTracker.settings.enableNotifications && 
            currentTime === sleepTracker.settings.bedtimeReminder) {
            
            if (window.hasNotificationSupport && Notification.permission === 'granted') {
                try {
                    new Notification('Quản lý Giấc ngủ', {
                        body: 'Đã đến giờ đi ngủ! 🌙',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
                        tag: 'bedtime-reminder',
                        requireInteraction: false
                    });
                } catch (e) {
                    // Fallback for Safari issues
                    console.warn('Notification failed:', e);
                    alert('🌙 Đã đến giờ đi ngủ!');
                }
            } else {
                // Fallback when notifications not supported
                alert('🌙 Đã đến giờ đi ngủ!');
            }
        }
    }, 60000); // Check every minute
});