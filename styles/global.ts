import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollViewContainer: {
    paddingTop: 24,
    alignItems: "center",
  },
  innerContent: {
    backgroundColor: "black",
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
  },

  headerContainer: {
    marginBottom: 25,
    paddingVertical: 13,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Tektur-Head",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ccc",
    fontFamily: "Tektur-Sub",
    textAlign: "center",
  },

  contentBox: {
    backgroundColor: "rgba(35, 35, 35, 0.9)",
    borderColor: "rgba(74, 144, 226, 0.18)",
    borderWidth: 1,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginVertical: 17,
    width: "90%",
    aspectRatio: 1.5,
    overflow: "hidden",
    padding: "5%",
  },
  tableContainer: {
    backgroundColor: "rgba(35, 35, 35, 0.9)",
    borderRadius: 30,
    marginVertical: 17,
    width: "90%",
    overflow: "hidden",
  },
  extendedTableContainer: {
    backgroundColor: "rgba(35, 35, 35, 0.92)",
    borderColor: "rgba(74, 144, 226, 0.18)",
    borderWidth: 1,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginVertical: 17,
    width: "90%",
    aspectRatio: 0.5,
    overflow: "hidden",
  },

  tableHeader: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: "rgba(74, 144, 226, 0.18)",
  },
  tableHeaderText: {
    fontSize: 25,
    fontFamily: "Tektur-Head",
    color: "white",
  },
  tableRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    width: "95%",
    alignSelf: "center",
  },
  rowTextLeft: {
    fontSize: 15,
    fontFamily: "Tektur-Sub",
    color: "white",
    marginVertical: 2,
  },
  rowTextRight: {
    fontSize: 15,
    fontFamily: "Tektur-Sub",
    color: "white",
    marginVertical: 2,
    textAlign: "right",
  },

  searchBarSection: {
    paddingHorizontal: 25,
    paddingBottom: 10,
    backgroundColor: "rgba(74, 144, 226, 0.18)"
  },
  searchBar: {
    backgroundColor: "#2323238c",
    borderColor: "rgba(20, 30, 43, 0.13)",
    borderRadius: 20,
    color: "white",
    paddingHorizontal: 14,
    fontFamily: "Tektur-Sub",
    width: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  searchBarInput: {
    fontSize: 15,
    fontFamily: "Tektur-Sub",
    color: "white",
    alignSelf: 'flex-start',
    width: '90%',
    //height: 30,
    margin: 'auto'
  },

  tableButton: {
    marginTop: 5,
    backgroundColor: "rgba(74, 144, 226, 0.18)",
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 9,
    elevation: 8,
    marginLeft: 4,
    flex: 0,
    minWidth: 60
  },
  tableButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Tektur-Sub",
    textAlign: "center",
  },

  formCard: {
    backgroundColor: "#181818",
    width: "94%",
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 38,
    marginBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.13,
    shadowRadius: 32,
    elevation: 12,
  },
  formFieldBlock: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    color: "#aad1fa",
    fontFamily: "Tektur-Sub",
    margin: 10,
    paddingLeft: 8,
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    color: "white",
    fontFamily: "Tektur-Sub",
    margin: 10,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  formLabel: {
    fontSize: 16,
    color: "#aad1fa",
    fontFamily: "Tektur-Sub",
    margin: 10,
    alignSelf: "flex-start",
    paddingLeft: 8,
  },

  inputField: {
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.18)",
    borderRadius: 10,
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 12,
    fontFamily: "Tektur-Sub",
    fontSize: 16,
    width: 260,
  },
  inputFieldNoBorder: {
    backgroundColor: "#232323",
    color: "white",
    paddingHorizontal: 14,
    marginHorizontal: 12,
    fontFamily: "Tektur-Sub",
    fontSize: 16,
    width: 260,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#232323",
    width: 260,
    aspectRatio: 5,
    margin: 10,
    justifyContent: "center",
  },
  pickerText: {
    color: "white",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontFamily: "Tektur",
  },

  errorMessage: {
    color: "#fa6d6d",
    fontSize: 13,
    marginBottom: 6,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 260,
  },

  dateButton: {
    backgroundColor: "#222",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
    marginBottom: 8,
    alignItems: "center",
    width: 260,
  },
  dateButtonText: {
    color: "#aad1fa",
    fontSize: 16,
    fontFamily: "Tektur-Sub",
    textAlign: "center",
  },

  submitButton: {
    marginTop: 26,
    backgroundColor: "#5294ec",
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 44,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 9,
    elevation: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "Tektur-Head",
    fontSize: 17,
    textAlign: "center",
  },

  deleteButton: {
    marginTop: 26,
    backgroundColor: "#ec5252ff",
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 44,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 9,
    elevation: 8,
  },
  miniDeleteButton: {
    marginTop: 26,
    backgroundColor: "#ec5252ff",
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 44,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 9,
    elevation: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: "Tektur-Head",
    fontSize: 17,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#181818",
    borderRadius: 24,
    width: "92%",
    maxHeight: "92%",
    alignSelf: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 28,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: "bold",
    fontFamily: "Tektur-Head",
    fontSize: 19,
    marginBottom: 10,
    marginTop: 2,
    color: "#aad1fa",
    textAlign: "center",
  },
  sectionLabel: {
    fontWeight: "600",
    fontFamily: "Tektur-Sub",
    fontSize: 15,
    marginBottom: 6,
    marginTop: 13,
    color: "#aad1fa",
  },
  input: {
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.18)",
    borderRadius: 10,
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 7,
    margin: 8,
    fontFamily: "Tektur-Sub",
    fontSize: 16,
    width: 110,
  },
  sortOrderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    marginHorizontal: 8,
    marginTop: 6,
    width: 120,
    alignItems: 'center',
    backgroundColor: "#222",
  },
  sortOrderButtonSelected: {
    backgroundColor: "#1EB1FC",
    borderColor: "#1EB1FC",
  },
  sortOrderText: {
    color: "#aad1fa",
    fontWeight: "600",
    fontFamily: "Tektur-Sub",
    fontSize: 15,
  },
  sortOrderTextSelected: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Tektur-Head",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 18,
    marginVertical: 15,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Tektur-Head",
  },

});

export const pickerStyles = {
  inputIOS: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontFamily: 'Tektur', // Your font here!
  },
  inputAndroid: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontFamily: 'Tektur', // May NOT work due to native spinner on Android
  },
  placeholder: {
    color: '#888',
    fontFamily: 'Tektur', // Supported on iOS
  },
};

export const modalStyles = StyleSheet.create({
  fabStyle: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#5294ec',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    zIndex: 99,
  },
  menuBox: {
    backgroundColor: '#232323',
    borderRadius: 18,
    padding: 28,
    width: 340,
    maxWidth: '94%',
    maxHeight: 500,        // or tweak as desired
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',  // Dims the background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: "#181818",
    borderRadius: 24,
    width: "92%",
    maxHeight: "92%",
    alignSelf: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 28,
    elevation: 10,
  },

  modalTitle: {
    fontWeight: "bold",
    fontFamily: "Tektur-Head",
    fontSize: 19,
    marginBottom: 10,
    marginTop: 2,
    color: "#aad1fa",
    textAlign: "center",
  },

  sectionLabel: {
    fontWeight: "600",
    fontFamily: "Tektur-Sub",
    fontSize: 15,
    marginBottom: 6,
    marginTop: 13,
    color: "#aad1fa",
  },

  input: {
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.18)",
    borderRadius: 10,
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 7,
    margin: 8,
    fontFamily: "Tektur-Sub",
    fontSize: 16,
    width: 110,
  },

  pickerFlat: {
    color: 'white',
    fontFamily: 'Tektur',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#232323',
    color: 'white',
    width: 140, // lower container width
    minHeight: 36,
    alignSelf: "flex-start", // avoid stretching to full row
    justifyContent: "center",
    marginVertical: 5,
  },

  // Horizontal row for amount inputs and date picker rows
  modalFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  // Date text style for better contrast
  dateDisplayText: {
    color: '#ffeb7a', // bright yellow for good contrast
    fontFamily: 'Tektur-Head',
    fontSize: 16,
    paddingHorizontal: 10,
  },

  // Button container - center and space buttons horizontally
  modalButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  sortOrderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    marginHorizontal: 8,
    marginTop: 6,
    backgroundColor: "#222",
  },
  sortOrderButtonSelected: {
    backgroundColor: "#1EB1FC",
    borderColor: "#1EB1FC",
  },
  sortOrderText: {
    color: "#aad1fa",
    fontWeight: "600",
    fontFamily: "Tektur-Sub",
    fontSize: 15,
  },
  sortOrderTextSelected: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Tektur-Head",
    fontSize: 15,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 18,
    marginVertical: 15,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Tektur-Head",
  },
});

export const pickerFlatStyle = {
  color: 'white',
  fontSize: 16,
  paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  paddingHorizontal: 10,
  fontFamily: 'Tektur',
  backgroundColor: '#232323',
};
