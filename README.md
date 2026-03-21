# Finance Management System

A production-ready backend for managing invoices, bank statements,
and financial reports with AI-powered data extraction.

## Live API

https://finance-management-system-2ke0.onrender.com

## Tech Stack

Node.js · Express · PostgreSQL · Claude AI · Tesseract OCR · JWT · Multer

## API Endpoints

POST /api/auth/register Register a new user

POST /api/auth/login Login and receive JWT token

POST /api/files/upload Upload invoice, bank statement, or report

GET /api/files Get all files for logged-in user

GET /api/files/:id/items Get extracted items for a file

GET /api/files/reconciliations Get reconciliation results

GET /api/dashboard/summary Overall income and expense summary

GET /api/dashboard/monthly Monthly income and expense breakdown

GET /api/dashboard/categories Breakdown by category
