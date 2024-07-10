import { StyleSheet, View, Text } from 'react-native';


export function DateWidget({day, dateDigit}) {
    console.log("this: ", dateDigit);
    return(
        <View style={styles.container}>
            <View style = {styles.topContainer}>
                <Text style = {styles.day} >{day}</Text>
            </View>
            <View style = {styles.lowerContainer}>
                <Text style={styles.dateDigit}>{dateDigit}</Text>
            </View>
            {/* <Text>Today's Date: {}</Text>     */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'red',
        overflow: 'hidden',
        flexDirection: 'column',
        borderRadius: 10,
        width: '150%',
        //height: '150%',
        flexGrow: 0,
        flexShrink: 0,
        height: 49,
        ///padding: 10,
    },
    topContainer: {
        backgroundColor: '#e1e4ec',
        paddingTop: 3,
        paddingHorizontal: 0,
        paddingBottom: 0,
        alignItems: 'center',
    },
    lowerContainer: {
        backgroundColor: '#f1f2f6',
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 5,
        alignItems: 'center',
        
    },
    dateDigit : {
        fontSize: 20,
        fontWeight: 'bold',
    },
    day: {
        color: 'gray',
        fontWeight: 'bold',
    },
});