import React, { useState } from 'react';
import axios from 'axios';

function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleVerifyCode = async () => {
    console.log('Verifying code:', verificationCode); // Add this line
    try {
      const response = await axios.post('http://localhost:9000/verify-code', { code: verificationCode });
      console.log('Verification response:', response.data); // Add this line
      if (response.data.valid) {
        setIsCodeValid(true);
      } else {
        setIsCodeValid(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  

  const handlePasswordChange = () => {
    if (password === confirmPassword) {
      // TODO: Handle password change
      console.log('Password changed successfully');
    } else {
      setPasswordMatch(false);
    }
  };

  return (
    <div>
    
      <h2>Enter Verification Code</h2>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <button onClick={handleVerifyCode}>Verify Code</button>

      {isCodeValid ? (
        <div>
          <h2>Change Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {!passwordMatch && <p>Passwords do not match</p>}
          <button onClick={handlePasswordChange}>Change Password</button>
        </div>
      ) : (
        <p>Verification code is invalid.</p>
      )}
    </div>
  );
}

export default Verify;
