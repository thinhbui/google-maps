import React, { Component } from 'react';
import {
    AppRegistry,
    Text,
    View,
    StyleSheet,
    Geolocation,
    TextInput,
    Dimensions,
    Modal,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView, { Circle, Marker } from 'react-native-maps';

const widthWindow = Dimensions.get('window').width;
export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            region: {
                latitude: 21.0285,
                longitude: 105.834,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
            text: '',
            point: {
                latitude: 21.0285,
                longitude: 105.834,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
            listRestaurant: [],
            iconVisible: true,
            placeDetail: {}
        }
    }

    componentWillMount() {
        console.log('componentWillMount');
        this.getAddress();
    }

    getGeoLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    region: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }
                })
            },
            (error) => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }, );
    }
    getAddress = async () => {
        await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.state.region.latitude},${this.state.region.longitude}&radius=500&type=restaurant&keyword=${this.state.text}&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg`)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log('getAddress');
                this.setState({
                    listRestaurant: responseJson.results
                })
            })
            .catch((error) => console.log(error));
    }
    onSubmit = () => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.text}&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg`)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                this.setState({
                    region: {
                        latitude: responseJson.results[0].geometry.location.lat,
                        longitude: responseJson.results[0].geometry.location.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }
                })
            })
            .catch((error) => console.log(error));
    }
    onPress = (e) => {
        if (this.state.iconVisible === false) this.setState({ iconVisible: true })

        console.log(e.nativeEvent);
        e.nativeEvent.coordinate.latitudeDelta = 0.01;
        e.nativeEvent.coordinate.longitudeDelta = 0.01;
        this.setState({
            region: {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }
        });
        this.getAddress();
        // this.getPlaceDetail();

    }
    getPlaceDetail = () => {
        const { region } = this.state;
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg`)
            .then((response) => response.json())
            .then((response) => {
                fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${response.results[0].place_id}&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg`)
                    .then((response) => response.json())
                    .then((response) => {
                        console.log(response);
                        this.setState({
                            placeDetail: response.result
                        })
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));
    }
    getDistance = () => {
        const { listRestaurant } = this.state;
        listRestaurant.map((item, index) => {
            fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${this.state.region.latitude},${this.state.region.longitude}&destinations=${item.geometry.location.lat},${item.geometry.location.lng}&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg`)
                .then((response) => response.json())
                .then((responseJson) => {
                    // console.log(responseJson);
                    if (responseJson.status === 'OK') {
                        listRestaurant[index].distance = responseJson.rows[0].elements[0].distance.text;
                        listRestaurant[index].duration = responseJson.rows[0].elements[0].duration.text;
                    }
                    return listRestaurant;
                })
                .then((list) => this.setState({ listRestaurant: list }))
                .catch((error) => console.log(error));
        })
    }
    renderItem() {
        // this.getDistance();
        const { listRestaurant } = this.state;
        return (
            listRestaurant.map((item) => {
                let uri = item.photos !== undefined ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&sensor=false&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg` : 'https://lh3.googleusercontent.com/p/AF1QipPX58ni92LRonfF8UU7solosed4v3yn8qeQgFMA=s1600-w400'
                return (
                    <TouchableOpacity style={styles.listItem} key={item.id}>
                        <View style={{ width: widthWindow * 0.3, height: widthWindow * 0.3 }}>
                            <Image source={{ uri: uri }} style={{ width: widthWindow * 0.3 - 20, height: widthWindow * 0.3 - 20, margin: 10 }} />
                        </View>
                        <View style={{ flex: 1, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: widthWindow / 2 }}>
                                <View style={{ margin: 2, height: 6, width: 6, borderRadius: 3, backgroundColor: 'green' }} />
                                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{item.name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ width: widthWindow / 2 }} numberOfLines={1} ellipsizeMode='tail'>{item.vicinity}</Text>
                                <Text style={{ fontSize: 10, marginRight: 5 }}>{item.distance}</Text>
                            </View>
                            <View></View>
                        </View>
                    </TouchableOpacity >
                )
            })
        )
    }
    renderAddress() {
        const { listRestaurant } = this.state;
        return (
            listRestaurant.map((item, index) => {
                if (item.opening_hours !== undefined && item.opening_hours.open_now || item.opening_hours === undefined) {
                    return (
                        <Circle
                            center={{ latitude: item.geometry.location.lat, longitude: item.geometry.location.lng }}
                            radius={10}
                            strokeWidth={3}
                            strokeColor='red'
                            key={index} />
                    )
                }
            })
        );
    }
    render() {
        const { region, listRestaurant, point, iconVisible, placeDetail } = this.state;
        // console.log(listRestaurant);
        console.log('render');
        return (
            <View style={{ flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width, backgroundColor: 'red', height: 60 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: '80%', borderRadius: 2, backgroundColor: '#fff', height: 40 }}>
                        <Icon name='search' style={{ margin: 5 }} backgroundColor='#fff' size={18} />
                        <TextInput
                            placeholder='Tìm kiếm địa điểm'
                            onChangeText={(text) => this.setState({ text })}
                            style={{ width: '80%', fontSize: 14 }}
                            onSubmitEditing={this.onSubmit}
                        />
                    </View>
                </View>


                {
                    iconVisible ?
                        <View style={{ flex: 1, backgroundColor: '#EEE' }}>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute', margin: 10, backgroundColor: 'black',
                                    opacity: 0.5, width: 30, justifyContent: 'center', alignItems: 'center',
                                    borderRadius: 3
                                }}
                                onPress={() => this.setState({ iconVisible: false })}
                            >
                                <Icon name='navicon' size={25} color='#fff' />
                            </TouchableOpacity>
                            <MapView
                                style={styles.map}
                                initialRegion={region}
                                onPress={this.onPress}
                            >
                                <Marker coordinate={region} title='AS' />
                                {this.renderAddress()}
                            </MapView>
                        </View>
                        :
                        <ScrollView style={{ flex: 1 }} >
                            <MapView
                                style={{ width: widthWindow, height: widthWindow * 0.75 }}
                                initialRegion={region}
                                onPress={this.onPress}
                            >
                                <Marker coordinate={region} title='asds' />
                                {this.renderAddress()}
                            </MapView>
                            {
                                this.renderItem()
                            }
                        </ScrollView>
                }
                {/* <Modal
                    visible={!this.state.iconVisible}
                    onRequestClose={() => this.setState({ iconVisible: false })}
                    transparent
                    style={{ height: 100 }}
                >
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: widthWindow * 0.6 }}></Text>
                </Modal> */}
            </View >
        );
    }
}
const styles = StyleSheet.create({
    map: {
        flex: 1,
        zIndex: -1,
    },
    listItem: {
        flexDirection: 'row',
        height: widthWindow * 0.3,
        borderWidth: 0.1,
        borderColor: 'gray',
        width: widthWindow
    }
});

//https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6655101,-73.89188969999998&key=AIzaSyAtGpZsO5uCJ8WdnaFF981OJM325Vc-QBg