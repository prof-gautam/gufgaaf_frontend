import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { FiMenu, FiLogOut } from "react-icons/fi"; // Adding FiLogOut for the logout icon

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // State to control sidebar visibility

  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(async () => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data);
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const logout = () => {
    localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY); // Clearing the user session
    navigate("/login"); // Redirecting to the login page
  };

  return (
    <>
      <Container>
        <HamburgerMenu onClick={toggleSidebar}>
          <FiMenu size={30} color="#fff" />
        </HamburgerMenu>
        <LogoutIcon onClick={logout}>
          <FiLogOut size={30} color="#fff" />
        </LogoutIcon>
        <div className={`container ${isSidebarVisible ? "show-sidebar" : ""}`}>
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 35% 65%;
    transition: all 0.3s ease-in-out;
    @media screen and (max-width: 768px) {
      width: 100vw;
      grid-template-columns: 1fr;
      &.show-sidebar {
        transform: translateX(25vw);
      }
    }
  }
`;

const HamburgerMenu = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5;
  cursor: pointer;
  @media screen and (min-width: 769px) {
    display: none;
  }
`;

const LogoutIcon = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 5;
  cursor: pointer;
`;
