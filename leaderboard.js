const Leaderboard = {
    STORAGE_KEY: 'race_dash_leaderboard',
    MAX_ENTRIES: 30,

    get() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        try {
            let list = data ? JSON.parse(data) : [];
            return this.clean(list); // Auto clean duplicates on get
        } catch (e) {
            console.error("Failed to parse leaderboard data", e);
            return [];
        }
    },

    // Clean duplicate names, keeping only the highest score
    clean(list) {
        if (!Array.isArray(list)) return [];
        const uniqueMap = new Map();
        list.forEach(entry => {
            const name = entry.name.trim();
            const time = parseFloat(entry.time);
            if (!uniqueMap.has(name) || time > uniqueMap.get(name).time) {
                uniqueMap.set(name, { name, time });
            }
        });
        const cleaned = Array.from(uniqueMap.values());
        cleaned.sort((a, b) => b.time - a.time);
        return cleaned.slice(0, this.MAX_ENTRIES);
    },

    save(name, time) {
        let list = this.get();
        const score = parseFloat(time);
        const nameClean = name.trim().substring(0, 10);
        
        // Find if name already exists
        const existingIndex = list.findIndex(entry => entry.name === nameClean);

        if (existingIndex !== -1) {
            // Only update if the new score is strictly higher
            if (score > list[existingIndex].time) {
                list[existingIndex].time = score;
            }
        } else {
            // New entry
            list.push({ name: nameClean, time: score });
        }

        // Final clean and sort
        list = this.clean(list);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        return list;
    },

    render(containerId, lang = 'zh') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const list = this.get();
        if (list.length === 0) {
            container.innerHTML = `<div style="opacity: 0.5; padding: 20px;">${lang === 'zh' ? '暂无排名' : 'No Rankings'}</div>`;
            return;
        }

        let html = '<div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">';
        list.forEach((entry, index) => {
            let crown = '';
            let style = `background: rgba(255,255,255,0.05); border-left: 3px solid rgba(255,255,255,0.2);`;
            
            if (index === 0) {
                crown = '👑 ';
                style = `background: rgba(255, 51, 85, 0.15); border-left: 4px solid #ff3355; box-shadow: 0 0 10px rgba(255, 51, 85, 0.2);`;
            } else if (index === 1) {
                crown = '🥈 ';
                style = `background: rgba(255, 255, 255, 0.08); border-left: 4px solid #aaa;`;
            } else if (index === 2) {
                crown = '🥉 ';
                style = `background: rgba(205, 127, 50, 0.08); border-left: 4px solid #cd7f32;`;
            }

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-radius: 12px; ${style}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #ff3355; font-weight: 900; width: 25px; text-align: left;">${index + 1}</span>
                        <span style="font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${crown}${entry.name}</span>
                    </div>
                    <span style="font-family: monospace; font-weight: 900; color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.3);">${entry.time.toFixed(1)}s</span>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }
};
