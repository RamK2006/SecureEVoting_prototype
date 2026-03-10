const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Auth endpoints
  async register(nationalId: string, password: string, constituencyId: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nationalId, password, constituencyId }),
    });
  }

  async login(nationalId: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nationalId, password }),
    });
  }

  // Voter endpoints
  async getVoterStatus(token: string) {
    return this.request('/voter/status', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  async getCurrentElection() {
    return this.request('/election/current', {
      method: 'GET',
    });
  }

  // Vote endpoints
  async generateVotingToken(token: string, electionId: string) {
    return this.request('/vote/token', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ electionId }),
    });
  }

  async castVote(votingToken: string, candidateId: string, electionId: string) {
    return this.request('/vote/cast', {
      method: 'POST',
      body: JSON.stringify({ token: votingToken, candidateId, electionId }),
    });
  }

  // Audit endpoints
  async verifyReceipt(receiptId: string) {
    return this.request(`/audit/verify/${receiptId}`, {
      method: 'GET',
    });
  }

  async getPublicStats() {
    return this.request('/audit/stats', {
      method: 'GET',
    });
  }
}

export default new ApiService();