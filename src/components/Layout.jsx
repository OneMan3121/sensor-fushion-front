import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MainContent from './MainContent';
import MobileDrawer from './MobileDrawer';
import styles from './Layout.module.css';

const Layout = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobileDrawer, setMobileDrawer] = useState({ open: false, side: null }); // 'left' or 'right'

  const toggleLeft = () => setLeftOpen(!leftOpen);
  const toggleRight = () => setRightOpen(!rightOpen);

  const openMobileDrawer = (side) => setMobileDrawer({ open: true, side });
  const closeMobileDrawer = () => setMobileDrawer({ open: false, side: null });

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawer.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawer.open]);

  return (
    <div className={styles.layout}>
      <Header
        toggleLeft={toggleLeft}
        toggleRight={toggleRight}
        openMobileDrawer={openMobileDrawer}
      />
      <div 
        className={styles.mainGrid}
        style={{
          gridTemplateColumns: `${leftOpen ? '250px' : '60px'} 1fr ${rightOpen ? '300px' : '0px'}`
        }}
      >
        <LeftSidebar open={leftOpen} />
        <MainContent />
        <RightSidebar open={rightOpen} />
      </div>
      <Footer />
      {mobileDrawer.open && (
        <MobileDrawer
          side={mobileDrawer.side}
          close={closeMobileDrawer}
        />
      )}
    </div>
  );
};

export default Layout;
