import { useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Stack,
  useDisclosure,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  Input,
  FormLabel,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showMenu, setShowMenu] = useState(false);

  const bg = useColorModeValue('gray.100', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');

  return (
    <>
      <Box bg={bg} py={4}>
        <Flex alignItems='center' justifyContent='space-between'>
          <IconButton
            aria-label='Toggle Menu'
            display={{ base: 'block', md: 'none' }}
            onClick={() => setShowMenu(!showMenu)}
            icon={<HamburgerIcon />}
          />
          <Text fontSize='lg' fontWeight='bold' color={color} mx={4}>
            My Website
          </Text>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            alignItems='center'
            spacing={4}
            display={{ base: showMenu ? 'block' : 'none', md: 'flex' }}
            mt={{ base: 4, md: 0 }}
          >
            <Text color={color}>Home</Text>
            <Text color={color}>About</Text>
            <Text color={color}>Contact</Text>
            <IconButton
              aria-label='Login'
              onClick={onOpen}
              variant='outline'
              colorScheme='gray'
              size='sm'
              icon={<i className='bi bi-box-arrow-in-right'></i>}
            />
          </Stack>
        </Flex>
      </Box>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <Box>
      <IconButton
        aria-label='Login'
        onClick={onClose}
        variant='outline'
        colorScheme='gray'
        size='sm'
        icon={<i className='bi bi-box-arrow-in-right'></i>}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login / Sign Up</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Email address</FormLabel>
                <Input type='email' placeholder='Enter email' />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Password</FormLabel>
                <Input type='password' placeholder='Password' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} type='submit'>
                Login
              </Button>
              <Button variant='ghost'>Sign Up</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}