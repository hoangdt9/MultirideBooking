import AsyncStorage from "@react-native-async-storage/async-storage";

const TICKET_STORAGE_KEY = "@ticket_info";

// Define the type for the ticket information
export interface Ticket {
  id: string; // Unique identifier for the ticket
  status: string;
  route: string;
  departureTime: string;
  seat: string;
}

/**
 * Save ticket information to AsyncStorage
 * @param {Ticket} ticket - Ticket information to save
 */
export const setTicketInfo = async (ticket: Ticket): Promise<void> => {
  try {
    const existingTickets = await getAllTickets();
    const updatedTickets = existingTickets
      ? [...existingTickets, ticket]
      : [ticket];
    const jsonValue = JSON.stringify(updatedTickets);
    await AsyncStorage.setItem(TICKET_STORAGE_KEY, jsonValue);
    console.log("Ticket information saved successfully.");
  } catch (e) {
    console.error("Failed to save the ticket information:", e);
  }
};

/**
 * Get all ticket information from AsyncStorage
 * @returns {Promise<Ticket[] | null>} - Array of tickets or null if not found
 */
export const getAllTickets = async (): Promise<Ticket[] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TICKET_STORAGE_KEY);
    return jsonValue != null ? (JSON.parse(jsonValue) as Ticket[]) : null;
  } catch (e) {
    console.error("Failed to retrieve the tickets:", e);
    return null;
  }
};

/**
 * Get a specific ticket by id from AsyncStorage
 * @param {string} id - The id of the ticket to retrieve
 * @returns {Promise<Ticket | null>} - The ticket or null if not found
 */
export const getTicketById = async (id: string): Promise<Ticket | null> => {
  try {
    const tickets = await getAllTickets();
    return tickets ? tickets.find((ticket) => ticket.id === id) || null : null;
  } catch (e) {
    console.error("Failed to retrieve the ticket by id:", e);
    return null;
  }
};

/**
 * Update ticket information by id
 * @param {string} id - The id of the ticket to update
 * @param {Partial<Ticket>} updates - The fields to update
 * @returns {Promise<boolean>} - True if the update was successful, false otherwise
 */
export const updateTicketById = async (
  id: string,
  updates: Partial<Ticket>
): Promise<boolean> => {
  try {
    const tickets = await getAllTickets();
    if (!tickets) return false;

    const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);
    if (ticketIndex === -1) return false;

    tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
    const jsonValue = JSON.stringify(tickets);
    await AsyncStorage.setItem(TICKET_STORAGE_KEY, jsonValue);
    console.log("Ticket updated successfully.");
    return true;
  } catch (e) {
    console.error("Failed to update the ticket:", e);
    return false;
  }
};

/**
 * Delete a ticket by id from AsyncStorage
 * @param {string} id - The id of the ticket to delete
 * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise
 */
export const deleteTicketById = async (id: string): Promise<boolean> => {
  try {
    const tickets = await getAllTickets();
    if (!tickets) return false;

    const updatedTickets = tickets.filter((ticket) => ticket.id !== id);
    const jsonValue = JSON.stringify(updatedTickets);
    await AsyncStorage.setItem(TICKET_STORAGE_KEY, jsonValue);
    console.log("Ticket deleted successfully.");
    return true;
  } catch (e) {
    console.error("Failed to delete the ticket:", e);
    return false;
  }
};

/**
 * Remove all ticket information from AsyncStorage
 */
export const clearAllTickets = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TICKET_STORAGE_KEY);
    console.log("All ticket information removed successfully.");
  } catch (e) {
    console.error("Failed to remove all ticket information:", e);
  }
};
