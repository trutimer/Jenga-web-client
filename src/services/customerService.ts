import { api } from './api';
import type {
  Customer,
  CustomerContactPerson,
  CustomerPayment,
  RecordPaymentRequest,
  Invoice,
  InvoiceItem,
  CustomerStatement,
  PageResponse,
  CustomerType,
  InvoiceStatus
} from '../models/types';

export const customerService = {
  // Get all customers with search, filter, and pagination
  async getAllCustomers(params?: {
    branchId?: string;
    type?: CustomerType;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Customer>> {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    query.append('page', (params?.page ?? 0).toString());
    query.append('size', (params?.size ?? 10).toString());

    const endpoint = `/api/customers?${query.toString()}`;
    return api.get<PageResponse<Customer>>(endpoint);
  },

  // Get customer details by ID
  async getCustomerById(id: string): Promise<Customer> {
    return api.get<Customer>(`/api/customers/${id}`);
  },

  // Create new customer
  async createCustomer(customer: Customer): Promise<Customer> {
    return api.post<Customer>('/api/customers', customer);
  },

  // Update existing customer
  async updateCustomer(id: string, customer: Customer): Promise<Customer> {
    return api.put<Customer>(`/api/customers/${id}`, customer);
  },

  // Add contact person to customer
  async addContactPerson(customerId: string, contact: CustomerContactPerson): Promise<CustomerContactPerson> {
    return api.post<CustomerContactPerson>(`/api/customers/${customerId}/contacts`, contact);
  },

  // Update contact person
  async updateContactPerson(customerId: string, contactId: string, contact: CustomerContactPerson): Promise<CustomerContactPerson> {
    return api.put<CustomerContactPerson>(`/api/customers/${customerId}/contacts/${contactId}`, contact);
  },

  // Delete contact person
  async deleteContactPerson(customerId: string, contactId: string): Promise<void> {
    return api.delete<void>(`/api/customers/${customerId}/contacts/${contactId}`);
  },

  // Get customer financial statement
  async getCustomerStatement(customerId: string): Promise<CustomerStatement> {
    return api.get<CustomerStatement>(`/api/customers/${customerId}/statement`);
  },

  // Record customer payment
  async recordPayment(request: RecordPaymentRequest): Promise<CustomerPayment> {
    return api.post<CustomerPayment>('/api/customer-payments', request);
  },

  // Get customer payments list
  async getAllPayments(params?: {
    branchId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<CustomerPayment>> {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    query.append('page', (params?.page ?? 0).toString());
    query.append('size', (params?.size ?? 10).toString());

    return api.get<PageResponse<CustomerPayment>>(`/api/customer-payments?${query.toString()}`);
  },

  // Get invoices list
  async getAllInvoices(params?: {
    branchId?: string;
    customerId?: string;
    status?: InvoiceStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Invoice>> {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    query.append('page', (params?.page ?? 0).toString());
    query.append('size', (params?.size ?? 10).toString());

    return api.get<PageResponse<Invoice>>(`/api/invoices?${query.toString()}`);
  },

  // Get single invoice by ID
  async getInvoiceById(id: string): Promise<Invoice> {
    return api.get<Invoice>(`/api/invoices/${id}`);
  },

  // Get items associated with an invoice
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return api.get<InvoiceItem[]>(`/api/invoices/${invoiceId}/items`);
  }
};
