import Input from '../form/Input';
import Button from '../form/Button';
import Dropzone from '../form/Dropzone';

import React, {useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDebounce} from '../../hooks/useDebounce';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useAuth} from '../../hooks/useAuth';
import {db, storage} from '../../setup/Firebase';

import {HiPencilSquare} from 'react-icons/hi2';

const NAME_REGEX = /^[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+([ -][A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+)*$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const Signup = () => {
  const [errors, setErrors] = useState({}); // Store input errors
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [inputPhoto, setInputPhoto] = useState('default');

  const navigate = useNavigate();
  const {signup} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  useDebounce(
    () => {
      // Validate first name and last name
      if (firstName && !NAME_REGEX.test(firstName)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: 'Wrong first name format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          firstName: '',
        }));
      }

      if (lastName && !NAME_REGEX.test(lastName)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: 'Wrong last name format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          lastName: '',
        }));
      }
    },
    0,
    [firstName, lastName]
  );

  useDebounce(
    () => {
      // Validate email
      if (email && !EMAIL_REGEX.test(email)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: 'Wrong e-mail format.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: '',
        }));
      }
    },
    0,
    [email]
  );

  useDebounce(
    () => {
      // Validate password
      if (password && password.length < 8) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must be at least 8 characters long.',
        }));
      } else if (password && password.length > 20) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must be at most 20 characters long.',
        }));
      } else if (password && !/\d/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one digit',
        }));
      } else if (password && !/[a-z]/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one lowercase letter.',
        }));
      } else if (password && !/[A-Z]/.test(password)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: 'Password must contain at least one uppercase letter',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: '',
        }));
      }
    },
    0,
    [password]
  );

  useDebounce(
    () => {
      // Validate password confirmation
      if (passwordConfirmation && password !== passwordConfirmation) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordConfirmation: 'Passwords do not match.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordConfirmation: '',
        }));
      }
    },
    0,
    [password, passwordConfirmation]
  );

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.map((file) => {
      const reader = new FileReader();

      reader.onload = function () {
        setInputPhoto(file);
      };

      reader.readAsDataURL(file);
      return file;
    });
  }, []);

  const onDropRejected = (fileRejections) => {
    if (fileRejections[0].errors[0].code === 'file-too-large') {
      addToast('error', 'The file is too large. Maximum size is 1MB.');
    } else {
      addToast('error', 'The file is not an image. Please upload an image file.');
    }
  };

  const onFileDialogCancel = useCallback(() => {
    setInputPhoto('default');
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    //Validation
    const inputFields = {firstName, lastName, email, password, passwordConfirmation};

    const emptyInputs = Object.keys(inputFields).filter((key) => inputFields[key] === '');

    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [input]: 'This field is required.',
        }));
      });

      addToast('error', 'Please fill out all required fields!');
      return;
    }

    if (Object.values(errors).some((error) => error !== '')) {
      addToast('error', 'There is an error with at least one field!');
      return;
    }

    if (password !== passwordConfirmation) {
      addToast('error', 'Passwords do not match!');
      return;
    }

    showLoader();
    signup(email, password)
      .then(async (cred) => {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`profile-pictures/${cred.user.uid}`);
        var imageUrl = 'default';

        if (inputPhoto !== 'default') {
          await fileRef.put(inputPhoto);
          imageUrl = await fileRef.getDownloadURL();
        }

        // Add user to the database
        await db
          .collection('users')
          .doc(cred.user.uid)
          .set({
            firstName: firstName,
            lastName: lastName,
            displayName: firstName + ' ' + lastName,
            email: email,
            photoURL: imageUrl,
            friends: [],
          });

        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setFirstName('');
        setLastName('');

        addToast('success', 'You have successfully signed up!');
        navigate('/');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          addToast('error', 'The email address is already in use.');
        } else if (error.code === 'auth/invalid-email') {
          addToast('error', 'The email address is not valid.');
        } else {
          addToast('error', error.message);
        }
      })
      .finally(() => {
        hideLoader();
      });
  };

  return (
    <>
      <h1>First Time Here?</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="field_wrapper">
          <Input
            type="text"
            value={firstName}
            label="First Name * "
            onChange={(value) => {
              setFirstName(value);
            }}
            autoFocus={true}
            error={errors.firstName}
            success={firstName && !errors.firstName}
          />
          <Input
            type="text"
            value={lastName}
            label="Last Name * "
            onChange={(value) => {
              setLastName(value);
            }}
            error={errors.lastName}
            success={lastName && !errors.lastName}
          />
        </div>
        <Input
          type="email"
          value={email}
          label="E-Mail * "
          onChange={(value) => {
            setEmail(value);
          }}
          error={errors.email}
          success={email && !errors.email}
        />
        <div className="field_wrapper">
          <Input
            type="password"
            value={password}
            label="Password * "
            onChange={(value) => {
              setPassword(value);
            }}
            error={errors.password}
          />
          <Input
            type="password"
            value={passwordConfirmation}
            label="Password again * "
            onChange={(value) => {
              setPasswordConfirmation(value);
            }}
          />
        </div>
        <Dropzone label="Upload a profile picture by dragging a file here or click to select" onDrop={onDrop} accept={'image/*'} multiple={false} maxFiles={1} maxSize={1048576} onDropRejected={onDropRejected} onFileDialogCancel={onFileDialogCancel} />
        <Button type="submit" text="Sign Up" className="primary">
          <HiPencilSquare />
        </Button>
      </form>
    </>
  );
};

export default Signup;
