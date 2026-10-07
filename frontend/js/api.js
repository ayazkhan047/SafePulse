/**
 * SafePulse API Client with Automatic Phantom Protocol Edge Fallback
 */

const SafePulseAPI = {
  baseUrl: '/api/v1',

  async getEmergencies() {
    try {
      const res = await fetch(`${this.baseUrl}/emergencies`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      localStorage.setItem('safepulse_cache_emergencies', JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('[SafePulse API] Network unavailable. Loading cached emergencies from Phantom Vault.');
      const cached = localStorage.getItem('safepulse_cache_emergencies');
      if (cached) return JSON.parse(cached);
      // Hardcoded fallback if zero cache
      return [
        { id: "bleeding", name: "Heavy Bleeding", short_name: "Bleeding", icon: "droplet", color: "#e03145", description: "Rapid blood loss, lacerations, puncture wounds" },
        { id: "burns", name: "Burns", short_name: "Burns", icon: "flame", color: "#e8761c", description: "Thermal, chemical, electrical, or scald burns" },
        { id: "choking", name: "Choking", short_name: "Choking", icon: "wind", color: "#12a66f", description: "Airway obstruction in conscious or unconscious persons" },
        { id: "cardiac", name: "Cardiac Emergency", short_name: "Cardiac", icon: "heart-pulse", color: "#d91e36", description: "Suspected heart attack, angina, or sudden collapse" },
        { id: "injury", name: "Serious Injury", short_name: "Injury", icon: "bone", color: "#6f63e0", description: "Fractures, head/spine trauma, severe musculoskeletal injury" }
      ];
    }
  },

  async getCategoryQuestions(categoryId) {
    try {
      const res = await fetch(`${this.baseUrl}/emergencies/${categoryId}/questions`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      localStorage.setItem(`safepulse_cache_q_${categoryId}`, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn(`[SafePulse API] Loading cached questions for ${categoryId}`);
      const cached = localStorage.getItem(`safepulse_cache_q_${categoryId}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  async assessTriage(categoryId, quickAnswers, detailedAnswers, categoryInfo) {
    try {
      const payload = {
        category: categoryId,
        quick_answers: quickAnswers,
        detailed_answers: detailedAnswers,
        client_mode: navigator.onLine ? "ONLINE" : "PHANTOM_OFFLINE"
      };

      const res = await fetch(`${this.baseUrl}/triage/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[SafePulse API] API call failed or offline. Invoking Phantom Protocol Edge Decision Engine.');
      // Execute offline triage locally via PhantomEngine!
      return PhantomEngine.assessOffline(categoryId, quickAnswers, detailedAnswers, categoryInfo);
    }
  },

  async getGuidance(categoryId, urgency) {
    try {
      const res = await fetch(`${this.baseUrl}/guidance/${categoryId}?urgency=${urgency}`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      localStorage.setItem(`safepulse_cache_g_${categoryId}_${urgency}`, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn(`[SafePulse API] Loading cached guidance for ${categoryId}/${urgency}`);
      const cached = localStorage.getItem(`safepulse_cache_g_${categoryId}_${urgency}`);
      if (cached) return JSON.parse(cached);
      throw err;
    }
  },

  async getModelMetrics() {
    try {
      const res = await fetch(`${this.baseUrl}/analytics/metrics`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      localStorage.setItem('safepulse_cache_metrics', JSON.stringify(data));
      return data;
    } catch (err) {
      const cached = localStorage.getItem('safepulse_cache_metrics');
      if (cached) return JSON.parse(cached);
      throw err;
    }
  }
};

window.SafePulseAPI = SafePulseAPI;
