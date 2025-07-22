import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function TransactionCard({ date, description, amount, category, type, onPress }) {
  //  color: green for moneyIn
  const isMoneyIn = type === 'moneyIn';
  const color = isMoneyIn ? '#388e3c' : '#d32f2f';
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.item}>
          <View style={styles.row}>
            <Text style={styles.date}>{date}</Text>
            <Text style={[styles.amount, { color }]}>{`$${amount}`}</Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.category}>
              <Text style={styles.categoryPillText}>{category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  colorBar: {
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 0,
  },
  item: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 64,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    flex: 1.2,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 2,
    marginRight: 8,
  },
  category: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    marginTop: 0,
    minWidth: 56,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#555',
  },
}); 