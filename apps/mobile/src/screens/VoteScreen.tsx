import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

type VoteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Vote'>;
type VoteScreenRouteProp = RouteProp<RootStackParamList, 'Vote'>;

interface Props {
  navigation: VoteScreenNavigationProp;
  route: VoteScreenRouteProp;
}

const VoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { election } = route.params;
  const { token, constituencyId } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [votingToken, setVotingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'submit'>('select');

  // Filter candidates for user's constituency
  const eligibleCandidates = election.candidates?.filter(
    (candidate: any) => candidate.constituencyId === constituencyId
  ) || [];

  useEffect(() => {
    generateVotingToken();
  }, []);

  const generateVotingToken = async () => {
    if (!token) return;

    try {
      const response = await ApiService.generateVotingToken(token, election.electionId);
      setVotingToken(response.token);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate voting token');
      navigation.goBack();
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleNext = () => {
    if (!selectedCandidate) {
      Alert.alert('Error', 'Please select a candidate');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('submit');
    submitVote();
  };

  const submitVote = async () => {
    if (!votingToken || !selectedCandidate) return;

    setLoading(true);
    try {
      const response = await ApiService.castVote(
        votingToken,
        selectedCandidate,
        election.electionId
      );

      Alert.alert(
        'Vote Cast Successfully!',
        'Your vote has been recorded on the blockchain.',
        [
          {
            text: 'View Receipt',
            onPress: () => navigation.replace('Receipt', { receipt: response.receipt }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Vote Failed', error.message || 'Failed to cast vote');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCandidateInfo = () => {
    return eligibleCandidates.find((c: any) => c.id === selectedCandidate);
  };

  if (step === 'submit') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Submitting your vote...</Text>
        <Text style={styles.loadingSubtext}>
          Encrypting vote and recording on blockchain
        </Text>
      </View>
    );
  }

  if (step === 'confirm') {
    const candidate = getSelectedCandidateInfo();
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Confirm Your Vote</Text>
          <Text style={styles.subtitle}>Please review your selection</Text>
        </View>

        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationTitle}>You are voting for:</Text>
          <View style={styles.candidateCard}>
            <Text style={styles.candidateName}>{candidate?.name}</Text>
            <Text style={styles.candidateParty}>{candidate?.party}</Text>
            <Text style={styles.candidateConstituency}>
              Constituency: {candidate?.constituencyId}
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Once submitted, your vote cannot be changed. Please ensure your selection is correct.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('select')}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm Vote</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{election.name}</Text>
        <Text style={styles.subtitle}>Select your candidate</Text>
        <Text style={styles.constituencyText}>
          Your constituency: {constituencyId}
        </Text>
      </View>

      <View style={styles.candidatesContainer}>
        {eligibleCandidates.length === 0 ? (
          <Text style={styles.noCandidates}>
            No candidates available for your constituency
          </Text>
        ) : (
          eligibleCandidates.map((candidate: any) => (
            <TouchableOpacity
              key={candidate.id}
              style={[
                styles.candidateCard,
                selectedCandidate === candidate.id && styles.candidateCardSelected,
              ]}
              onPress={() => handleCandidateSelect(candidate.id)}
            >
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.candidateParty}>{candidate.party}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedCandidate === candidate.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {eligibleCandidates.length > 0 && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedCandidate && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedCandidate}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
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
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  constituencyText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  candidatesContainer: {
    marginBottom: 30,
  },
  noCandidates: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  candidateParty: {
    fontSize: 16,
    color: '#64748b',
  },
  candidateConstituency: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmationCard: {
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
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VoteScreen;