import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { token, voterHash, constituencyId, logout } = useAuth();
  const [voterStatus, setVoterStatus] = useState<any>(null);
  const [currentElection, setCurrentElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!token) return;

    try {
      const [statusResponse, electionResponse] = await Promise.all([
        ApiService.getVoterStatus(token),
        ApiService.getCurrentElection(),
      ]);

      setVoterStatus(statusResponse);
      setCurrentElection(electionResponse);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleVote = () => {
    if (!currentElection || !currentElection.electionId) {
      Alert.alert('No Election', 'There is no active election at this time.');
      return;
    }

    if (voterStatus?.hasVoted) {
      Alert.alert('Already Voted', 'You have already cast your vote in this election.');
      return;
    }

    if (!voterStatus?.isEligible) {
      Alert.alert('Not Eligible', 'You are not eligible to vote in this election.');
      return;
    }

    navigation.navigate('Vote', { election: currentElection });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          await logout();
          navigation.replace('Login');
        }},
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Voter Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Voter Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Voter ID:</Text>
          <Text style={styles.infoValue}>{voterHash?.substring(0, 16)}...</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Constituency:</Text>
          <Text style={styles.infoValue}>{constituencyId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[
            styles.infoValue,
            { color: voterStatus?.isEligible ? '#059669' : '#dc2626' }
          ]}>
            {voterStatus?.isEligible ? 'Eligible' : 'Not Eligible'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Voted:</Text>
          <Text style={[
            styles.infoValue,
            { color: voterStatus?.hasVoted ? '#dc2626' : '#059669' }
          ]}>
            {voterStatus?.hasVoted ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Election</Text>
        {currentElection && currentElection.electionId ? (
          <>
            <Text style={styles.electionName}>{currentElection.name}</Text>
            <Text style={styles.electionDescription}>{currentElection.description}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Candidates:</Text>
              <Text style={styles.infoValue}>{currentElection.candidates?.length || 0}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[
                styles.infoValue,
                { color: currentElection.isActive ? '#059669' : '#dc2626' }
              ]}>
                {currentElection.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noElection}>No active election</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.voteButton,
          (!voterStatus?.isEligible || voterStatus?.hasVoted || !currentElection?.isActive) && styles.voteButtonDisabled
        ]}
        onPress={handleVote}
        disabled={!voterStatus?.isEligible || voterStatus?.hasVoted || !currentElection?.isActive}
      >
        <Text style={styles.voteButtonText}>
          {voterStatus?.hasVoted ? 'Already Voted' : 'Cast Your Vote'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  electionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  electionDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  noElection: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  voteButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  voteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;