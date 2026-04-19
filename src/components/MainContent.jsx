import React from 'react';
import styles from './MainContent.module.css';

const MainContent = () => {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h2>Welcome to the Dashboard</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Total Users</h3>
            <p className={styles.number}>1,234</p>
          </div>
          <div className={styles.card}>
            <h3>Revenue</h3>
            <p className={styles.number}>$12,345</p>
          </div>
          <div className={styles.card}>
            <h3>Orders</h3>
            <p className={styles.number}>567</p>
          </div>
          <div className={styles.card}>
            <h3>Growth</h3>
            <p className={styles.number}>+15%</p>
          </div>
        </div>
        <div className={styles.chartPlaceholder}>
          <h3>Analytics Chart</h3>
          <div className={styles.placeholder}>
            Chart will be here
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
