class SleepSmartAdvisor {
    constructor() {
        this.sleepData = [];
        this.settings = {};
        this.isInitialized = false;
        this.analysisCache = {};
        
        this.geminiApiKey = window.CONFIG?.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
        this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.aiEnabled = this.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE';
    }

    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.isInitialized = true;
        console.log('Smart Sleep Advisor initialized', this.aiEnabled ? 'with AI' : 'without AI');
    }

    bindEvents() {
        const analyzeBtn = document.getElementById('analyze-sleep-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.performSmartAnalysis());
        }
    }

    loadData(sleepData, settings) {
        this.sleepData = sleepData || [];
        this.settings = settings || {};
    }

    async performSmartAnalysis() {
        try {
            this.showLoading();
            this.hideError();

            // Phân tích dữ liệu ngủ
            const analysis = this.analyzeSleepPatterns();
            
            // Cập nhật giao diện cơ bản
            this.updateAnalysisUI(analysis);
            
            // Thử sử dụng AI nếu có
            if (this.aiEnabled) {
                try {
                    const aiAdvice = await this.getAIAdvice(analysis);
                    this.updateAdviceUI(aiAdvice);
                    
                    const aiSchedule = await this.getAISchedule(analysis);
                    this.updateScheduleUI(aiSchedule);
                } catch (aiError) {
                    console.warn('AI failed, using fallback:', aiError);
                    // Fallback về thuật toán đơn giản
                    const fallbackAdvice = this.generateSmartAdvice(analysis);
                    const fallbackSchedule = this.createTodaySleepPlan(analysis);
                    
                    this.updateAdviceUI(fallbackAdvice);
                    this.updateScheduleUI(fallbackSchedule);
                }
            } else {
                // Sử dụng thuật toán đơn giản
                const advice = this.generateSmartAdvice(analysis);
                const schedule = this.createTodaySleepPlan(analysis);
                
                this.updateAdviceUI(advice);
                this.updateScheduleUI(schedule);
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
        } finally {
            this.hideLoading();
        }
    }

    // AI Methods (ẩn khỏi người dùng)
    async getAIAdvice(analysis) {
        if (!this.aiEnabled) throw new Error('AI not configured');
        
        const prompt = this.createAIAdvicePrompt(analysis);
        const response = await this.callGeminiAPI(prompt);
        return this.parseAIAdviceResponse(response);
    }

    async getAISchedule(analysis) {
        if (!this.aiEnabled) throw new Error('AI not configured');
        
        const prompt = this.createAISchedulePrompt(analysis);
        const response = await this.callGeminiAPI(prompt);
        return this.parseAIScheduleResponse(response);
    }

    async callGeminiAPI(prompt) {
        const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    createAIAdvicePrompt(analysis) {
        const { weeklyData, metrics, issues } = analysis;
        
        return `Bạn là một chuyên gia về giấc ngủ. Hãy phân tích dữ liệu giấc ngủ sau và đưa ra lời khuyên:

Dữ liệu giấc ngủ 7 ngày qua:
${weeklyData.map(entry => {
    const start = new Date(entry.bedtime);
    const end = new Date(entry.wakeTime);
    const duration = (end - start) / (1000 * 60 * 60);
    return `- ${entry.date}: ${duration.toFixed(1)}h, giờ đi ngủ: ${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`;
}).join('\n')}

Chỉ số hiện tại:
- Thời gian ngủ trung bình: ${metrics.averageSleep}h
- Thiếu hụt giấc ngủ: ${metrics.deficit}h
- Độ nhất quán: ${metrics.consistency}%
- Chất lượng: ${metrics.quality}/100

Vấn đề chính: ${issues.join(', ')}

Hãy đưa ra lời khuyên cụ thể để cải thiện giấc ngủ, bao gồm:
1. Đánh giá tình trạng hiện tại
2. Lời khuyên cụ thể để cải thiện
3. Thói quen nên thay đổi

Trả lời bằng tiếng Việt, ngắn gọn và thực tế.`;
    }

    createAISchedulePrompt(analysis) {
        const { metrics, deficit } = analysis;
        const now = new Date();
        
        return `Bạn là chuyên gia về giấc ngủ. Hãy tạo kế hoạch ngủ hôm nay dựa trên:

Tình trạng hiện tại:
- Thời gian ngủ trung bình: ${metrics.averageSleep}h
- Thiếu hụt giấc ngủ: ${metrics.deficit}h
- Độ nhất quán: ${metrics.consistency}%
- Giờ hiện tại: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}

Hãy tạo:
1. Kế hoạch ngủ hôm nay (bao nhiêu tiếng, tại sao)
2. Giờ đi ngủ tối ưu (dựa trên giờ hiện tại)
3. Lời khuyên về thời gian ngủ

Trả lời bằng tiếng Việt, ngắn gọn và thực tế.`;
    }

    parseAIAdviceResponse(data) {
        try {
            const text = data.candidates[0].content.parts[0].text;
            return text;
        } catch (error) {
            console.error('Failed to parse AI advice response:', error);
            return 'Hệ thống đã phân tích dữ liệu của bạn và đưa ra lời khuyên dựa trên khoa học về giấc ngủ.';
        }
    }

    parseAIScheduleResponse(data) {
        try {
            const text = data.candidates[0].content.parts[0].text;
            return {
                plan: text,
                suggestedBedtime: 'Được tư vấn bởi hệ thống thông minh',
                targetHours: 8
            };
        } catch (error) {
            console.error('Failed to parse AI schedule response:', error);
            return {
                plan: 'Hệ thống đã tạo kế hoạch ngủ tối ưu dựa trên dữ liệu của bạn.',
                suggestedBedtime: 'Được tính toán tự động',
                targetHours: 8
            };
        }
    }

    // Fallback Methods (thuật toán đơn giản)
    analyzeSleepPatterns() {
        const weeklyData = this.getWeeklySleepData();
        const metrics = this.calculateSleepMetrics(weeklyData);
        const issues = this.identifySleepIssues(metrics);
        const improvements = this.suggestImprovements(metrics, issues);
        
        return {
            weeklyData,
            metrics,
            issues,
            improvements
        };
    }

    getWeeklySleepData() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return this.sleepData.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekAgo && entryDate <= now;
        });
    }

    calculateSleepMetrics(weeklyData) {
        if (weeklyData.length === 0) {
            return {
                averageSleep: 0,
                totalSleep: 0,
                consistency: 0,
                deficit: 0,
                quality: 0
            };
        }

        const sleepHours = weeklyData.map(entry => {
            const start = new Date(entry.bedtime);
            const end = new Date(entry.wakeTime);
            return (end - start) / (1000 * 60 * 60);
        });

        const averageSleep = sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length;
        const totalSleep = sleepHours.reduce((sum, hours) => sum + hours, 0);
        
        // Tính độ nhất quán (độ lệch chuẩn)
        const variance = sleepHours.reduce((sum, hours) => sum + Math.pow(hours - averageSleep, 2), 0) / sleepHours.length;
        const consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
        
        // Tính thiếu hụt giấc ngủ (so với 8 tiếng/ngày)
        const targetSleep = 8 * 7; // 8 tiếng x 7 ngày
        const deficit = Math.max(0, targetSleep - totalSleep);
        
        // Đánh giá chất lượng (dựa trên độ nhất quán và thời gian)
        const quality = Math.min(100, (consistency + (averageSleep / 8) * 50));

        return {
            averageSleep: Math.round(averageSleep * 10) / 10,
            totalSleep: Math.round(totalSleep * 10) / 10,
            consistency: Math.round(consistency),
            deficit: Math.round(deficit * 10) / 10,
            quality: Math.round(quality)
        };
    }

    identifySleepIssues(metrics) {
        const issues = [];
        
        if (metrics.averageSleep < 7) {
            issues.push('Thời gian ngủ trung bình quá ít');
        } else if (metrics.averageSleep > 9) {
            issues.push('Thời gian ngủ trung bình quá nhiều');
        }
        
        if (metrics.consistency < 70) {
            issues.push('Lịch trình ngủ không đều đặn');
        }
        
        if (metrics.deficit > 5) {
            issues.push('Thiếu hụt giấc ngủ đáng kể');
        }
        
        if (metrics.quality < 60) {
            issues.push('Chất lượng giấc ngủ cần cải thiện');
        }
        
        return issues.length > 0 ? issues : ['Giấc ngủ của bạn khá ổn định'];
    }

    suggestImprovements(metrics, issues) {
        const improvements = [];
        
        if (metrics.averageSleep < 7) {
            improvements.push('Tăng thời gian ngủ lên 7-8 tiếng mỗi ngày');
        }
        
        if (metrics.consistency < 70) {
            improvements.push('Cố gắng ngủ và thức dậy cùng giờ mỗi ngày');
        }
        
        if (metrics.deficit > 5) {
            improvements.push('Bù đắp thiếu hụt bằng cách ngủ thêm 1-2 tiếng vào cuối tuần');
        }
        
        return improvements;
    }

    generateSmartAdvice(analysis) {
        const { metrics, issues, improvements } = analysis;
        
        let advice = '';
        
        if (metrics.averageSleep < 6) {
            advice = 'Bạn cần ngủ nhiều hơn. Hãy cố gắng ngủ ít nhất 7-8 tiếng mỗi ngày để cơ thể có đủ thời gian phục hồi.';
        } else if (metrics.averageSleep < 7) {
            advice = 'Thời gian ngủ của bạn hơi ít. Hãy tăng lên 7-8 tiếng để có sức khỏe tốt hơn.';
        } else if (metrics.averageSleep > 9) {
            advice = 'Bạn ngủ khá nhiều. Có thể giảm xuống 7-8 tiếng để tránh cảm giác mệt mỏi khi thức dậy.';
        } else {
            advice = 'Thời gian ngủ của bạn rất hợp lý! Hãy duy trì thói quen này.';
        }
        
        if (metrics.consistency < 70) {
            advice += ' Điều quan trọng là duy trì lịch trình ngủ đều đặn. Hãy cố gắng ngủ và thức dậy cùng giờ mỗi ngày.';
        }
        
        return advice;
    }

    createTodaySleepPlan(analysis) {
        const { metrics, deficit } = analysis;
        const now = new Date();
        const currentHour = now.getHours();
        
        let plan = '';
        let suggestedBedtime = '';
        
        // Tính toán thời gian ngủ cần thiết hôm nay
        let targetSleepHours = 8;
        
        if (deficit > 3) {
            targetSleepHours = Math.min(10, 8 + deficit / 7); // Bù đắp dần dần
            plan = `Hôm nay bạn nên ngủ ${Math.round(targetSleepHours * 10) / 10} tiếng để bù đắp thiếu hụt giấc ngủ. `;
        } else {
            plan = `Hôm nay bạn nên ngủ ${targetSleepHours} tiếng để duy trì sức khỏe tốt. `;
        }
        
        // Gợi ý giờ đi ngủ
        if (currentHour < 22) {
            const wakeTime = new Date(now);
            wakeTime.setDate(wakeTime.getDate() + 1);
            wakeTime.setHours(6, 0, 0, 0); // Giả sử thức dậy lúc 6h sáng
            
            const bedtime = new Date(wakeTime.getTime() - targetSleepHours * 60 * 60 * 1000);
            suggestedBedtime = `Nên đi ngủ lúc ${bedtime.getHours()}:${bedtime.getMinutes().toString().padStart(2, '0')} để thức dậy lúc 6:00 sáng.`;
        } else {
            suggestedBedtime = 'Bạn nên đi ngủ sớm hơn để có đủ thời gian ngủ.';
        }
        
        plan += suggestedBedtime;
        
        return {
            plan,
            suggestedBedtime,
            targetHours: targetSleepHours
        };
    }

    updateAnalysisUI(analysis) {
        const { weeklyData, metrics, issues } = analysis;
        
        // Cập nhật tóm tắt tuần qua
        const weeklySummary = document.getElementById('weekly-sleep-summary');
        if (weeklySummary) {
            if (weeklyData.length > 0) {
                weeklySummary.innerHTML = `
                    <p><strong>Trung bình:</strong> ${metrics.averageSleep} tiếng/ngày</p>
                    <p><strong>Tổng cộng:</strong> ${metrics.totalSleep} tiếng/tuần</p>
                    <p><strong>Độ nhất quán:</strong> ${metrics.consistency}%</p>
                    <p><strong>Chất lượng:</strong> ${metrics.quality}/100</p>
                `;
            } else {
                weeklySummary.innerHTML = '<p>Chưa có dữ liệu ngủ trong tuần qua</p>';
            }
        }
        
        // Cập nhật vấn đề chính
        const mainIssues = document.getElementById('main-issues');
        if (mainIssues) {
            mainIssues.innerHTML = issues.map(issue => `<p>• ${issue}</p>`).join('');
        }
    }

    updateAdviceUI(advice) {
        const healthAdvice = document.getElementById('health-advice');
        if (healthAdvice) {
            healthAdvice.innerHTML = `<p>${advice}</p>`;
        }
    }

    updateScheduleUI(todayPlan) {
        const todaySleepPlan = document.getElementById('today-sleep-plan');
        const suggestedBedtime = document.getElementById('suggested-bedtime');
        
        if (todaySleepPlan) {
            todaySleepPlan.innerHTML = `<p>${todayPlan.plan}</p>`;
        }
        
        if (suggestedBedtime) {
            suggestedBedtime.innerHTML = `<p><strong>Thời gian ngủ:</strong> ${Math.round(todayPlan.targetHours * 10) / 10} tiếng</p>`;
        }
    }

    showLoading() {
        const loading = document.getElementById('ai-loading');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('ai-loading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        const error = document.getElementById('ai-error');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    }

    hideError() {
        const error = document.getElementById('ai-error');
        if (error) error.style.display = 'none';
    }
}

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.sleepSmartAdvisor = new SleepSmartAdvisor();
    window.sleepSmartAdvisor.init();
});
