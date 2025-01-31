import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ORDER_STATUSES = ['Pending', 'Accepted', 'Sending', 'Finished'];

const getStatusIndex = (status) => {
  switch (status?.toLowerCase()) {
    case 'pendiente':
      return ORDER_STATUSES.indexOf('Pending');
    case 'aceptada':
      return ORDER_STATUSES.indexOf('Accepted');
    case 'envio':
      return ORDER_STATUSES.indexOf('Sending');
    case 'finalizada':
      return ORDER_STATUSES.indexOf('Finished');
    default:
      return -1;
  }
};

export const OrderStatusTracker = ({ currentStatus }) => {
  const progressValue = new Animated.Value(0);
  const currentIndex = getStatusIndex(currentStatus);
  const displayStatus = ORDER_STATUSES[currentIndex] || 'Pending';

  useEffect(() => {
    Animated.timing(progressValue, {
      toValue:
        currentIndex >= 0 ? currentIndex / (ORDER_STATUSES.length - 1) : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.currentStatus}>{displayStatus}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
        <View style={styles.pointsContainer}>
          {ORDER_STATUSES.map((status, index) => {
            const isActive = index <= currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <View key={status} style={styles.pointWrapper}>
                <View
                  style={[
                    styles.point,
                    isActive && styles.activePoint,
                    isCompleted && styles.completedPoint,
                  ]}
                />
                <Text style={[styles.pointLabel, isActive && styles.activeLabel]}>
                  {status}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  currentStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    height: 80,
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    top: 30,
    left: 0,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
  },
  pointWrapper: {
    alignItems: 'center',
    width: 70,
  },
  point: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  activePoint: {
    borderColor: '#3B82F6',
  },
  completedPoint: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pointLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
