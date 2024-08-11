import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, Modal, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const initialRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const App = () => {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(initialRegion);
  const [showList, setShowList] = useState(false);
  const [areas, setAreas] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAreaCoords, setNewAreaCoords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [areaName, setAreaName] = useState('');

  const onMapPress = (e) => {
    console.log(e);
    
    if (isDrawing) {
      setNewAreaCoords([...newAreaCoords, e.nativeEvent.coordinate]);
    }
  };

  const finishDrawing = () => {
    console.log(newAreaCoords);
    
    if (newAreaCoords.length > 2) {
      setIsDrawing(false);
      setShowModal(true);
    }
  };

  const saveArea = () => {
    const newArea = {
      name: areaName,
      coordinates: newAreaCoords,
      area: calculateArea(newAreaCoords),
    };
    setAreas([...areas, newArea]);
    setNewAreaCoords([]);
    setAreaName('');
    setShowModal(false);
  };

  const calculateArea = (coordinates) => {
    let totalArea = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const x1 = coordinates[i].latitude;
      const y1 = coordinates[i].longitude;
      const x2 = coordinates[i + 1].latitude;
      const y2 = coordinates[i + 1].longitude;
      totalArea += (x1 * y2 - x2 * y1) / 2;
    }
    return Math.abs(totalArea);
  };

  const deleteArea = (index) => {
    const newAreas = [...areas];
    newAreas.splice(index, 1);
    setAreas(newAreas);
  };

  const jumpToArea = (coordinates) => {
    console.log(coordinates);
    
    mapRef.current.animateToRegion({
      ...coordinates[0],
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={onMapPress}
        ref={mapRef}
      >
        {areas.map((area, index) => (
          <Polygon
            key={index}
            coordinates={area.coordinates}
            strokeColor="#F00"
            strokeWidth={2}
            fillColor="rgba(255,0,0,0.3)"
          />
        ))}
        {isDrawing && newAreaCoords.length > 0 && (
          <Polygon
            coordinates={newAreaCoords}
            strokeColor="#00F"
            strokeWidth={2}
            fillColor="transparent"
          />
        )}
        {areas.map((area, index) => (
          <Marker
            key={index}
            coordinate={area.coordinates[0]}
            title={area.name}
            description={`${area.area} SF`}
          />
        ))}
      </MapView>
      {isDrawing && (
        <TouchableOpacity style={styles.finishButton} onPress={finishDrawing}>
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.listIcon} onPress={() => setShowList(!showList)}>
        <Ionicons name="list-outline" size={30} color="black" />
      </TouchableOpacity>
      {showList && (
        <View style={styles.listContainer}>
          {areas.map((area, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => jumpToArea(area.coordinates)}
            >
              <Text style={styles.listItemText}>{area.name}</Text>
              <Text style={styles.listItemText}>{area.area} SF</Text>
              <Button title="Delete" onPress={() => deleteArea(index)} />
            </TouchableOpacity>
          ))}
          <Button title="Create Area" onPress={() => setIsDrawing(true)} color={"green"}/>
        </View>
      )}
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Area Name"
            value={areaName}
            onChangeText={setAreaName}
            style={styles.input}
          />
          <View style={{gap:20}}>
          <Button title="Save" onPress={saveArea} color={"green"}/>
          <Button title="Cancel" onPress={() => setShowModal(false)} color={"green"}/>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  listIcon: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    right: 20,
    zIndex: 1,
    backgroundColor: '#FFFFFF', 
    padding: 8,
    borderRadius: 20, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  finishButton: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    left: 20,
    backgroundColor: '#4CAF50', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, 
    zIndex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', 
    padding: 20,
    zIndex: 1,
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex:1,
   
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F0F4F8'
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5', 
    padding: 10,
    marginBottom: 20,
    borderRadius: 10, 
    backgroundColor: '#FFFFFF', 
  },
  saveButton: {
    backgroundColor: '#2196F3', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10, 
    marginRight: 10,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F44336', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10, 
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default App;
