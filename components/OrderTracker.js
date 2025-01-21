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
      toValue: currentIndex >= 0 ? currentIndex / (ORDER_STATUSES.length - 1) : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Status Text */}
      <Text style={styles.currentStatus}>{displayStatus}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
            },
          ]}
        />

        {/* Status Points */}
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
                <Text
                  style={[
                    styles.pointLabel,
                    isActive && styles.activeLabel,
                  ]}
                >
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentStatus: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    height: 90,
    marginTop: 10,
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    top: 35,
    left: 0,
    height: 4,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 25,
    paddingHorizontal: 16,
  },
  pointWrapper: {
    alignItems: 'center',
    width: 75,
  },
  point: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  activePoint: {
    borderColor: '#4F46E5',
    backgroundColor: 'white',
  },
  completedPoint: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  pointLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
