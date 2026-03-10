# SecureVote - Demo Ready! 🎬

Your SecureVote blockchain e-voting system is ready for demo recording!

## Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start the complete demo
npm run demo
```

That's it! The script will:
- Build shared types
- Start local blockchain
- Deploy smart contracts
- Setup database
- Start all services

## Demo URLs

- **Backend API**: http://localhost:3000
- **Audit Portal**: http://localhost:3001  
- **Mobile App**: Scan QR code in terminal

## Test Credentials

- **National ID**: `123456789012`
- **Password**: `TestPass123!`
- **Constituency**: `const-001`

## Demo Flow

1. **Mobile App Registration**
   - Open mobile app
   - Register with test credentials
   - Show successful blockchain registration

2. **Voting Process**
   - Login with credentials
   - View available elections
   - Select candidate and cast vote
   - Show encrypted vote submission
   - Display receipt with QR code

3. **Receipt Verification**
   - Open audit portal
   - Verify receipt using receipt ID
   - Show blockchain proof
   - Display vote confirmation

4. **Real-time Statistics**
   - Show live vote counts
   - Display constituency breakdown
   - Demonstrate transparency

## Architecture Highlights

- **Two-Chain Design**: Separate identity and vote chains for anonymity
- **End-to-End Encryption**: Votes encrypted client-side
- **Zero-Knowledge Proofs**: Privacy-preserving vote validation (simulated)
- **Blockchain Immutability**: Tamper-proof vote storage
- **Real-time Updates**: Live statistics and transparency

## Key Features Demonstrated

✅ **Voter Registration** - Secure identity hashing  
✅ **Anonymous Voting** - Unlinkable votes  
✅ **Receipt Generation** - Verifiable proof  
✅ **Public Audit** - Transparent verification  
✅ **Real-time Stats** - Live transparency  
✅ **Mobile-First** - Accessible voting  
✅ **Blockchain Security** - Immutable records  

## Production Notes

This is an MVP demonstration. For production:
- Replace ZK proof simulation with real ZK-SNARKs
- Use production-grade key management
- Implement proper HSM integration
- Add comprehensive audit logging
- Scale blockchain infrastructure

## Troubleshooting

If something doesn't work:
1. Check all terminals are running
2. Ensure ports 3000, 3001, 8545 are free
3. Restart with `npm run demo`

**Ready to record your demo! 🎥**