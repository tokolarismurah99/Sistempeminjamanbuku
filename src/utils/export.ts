import { Book, Borrowing, User } from '../types';

// Export to Excel (CSV format - compatible with Excel)
export const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('Tidak ada data untuk di-export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF (using browser print)
export const exportToPDF = (title: string, data: any[], columns: string[]) => {
  if (data.length === 0) {
    alert('Tidak ada data untuk di-export');
    return;
  }

  // Create a new window with printable content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Pop-up diblokir! Izinkan pop-up untuk export PDF');
    return;
  }

  // Create HTML table
  let tableHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #059669;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #059669;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #059669;
          color: #666;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>SmartLib Ubhara</h1>
      <div class="subtitle">Sistem Peminjaman Buku - ${title}</div>
      <div style="margin-bottom: 10px;">
        <strong>Tanggal Export:</strong> ${new Date().toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col] || '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p><strong>SmartLib Ubhara</strong> - Perpustakaan Universitas Bhayangkara Jakarta Raya</p>
        <p>Total Data: ${data.length}</p>
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(tableHTML);
  printWindow.document.close();
};

// Prepare data for export - Books
export const prepareBookDataForExport = (books: Book[]) => {
  return books.map(book => ({
    'ID': book.id,
    'Judul': book.title,
    'Penulis': book.author,
    'Penerbit': book.publisher,
    'Kategori': book.category,
    'Tahun Terbit': book.publishYear,
    'Stok': book.stock,
  }));
};

// Prepare data for export - Borrowings
export const prepareBorrowingDataForExport = (
  borrowings: Borrowing[], 
  books: Book[], 
  users: User[]
) => {
  return borrowings.map(borrow => {
    const user = users.find(u => u.id === borrow.userId);
    const bookTitles = borrow.details
      .map(detail => {
        const book = books.find(b => b.id === detail.bookId);
        return `${book?.title} (${detail.quantity}x)`;
      })
      .join(', ');
    
    return {
      'Invoice': borrow.id,
      'Anggota': user?.name || '-',
      'ID Anggota': user?.membershipId || '-',
      'Buku': bookTitles,
      'Tgl Pinjam': new Date(borrow.borrowDate).toLocaleDateString('id-ID'),
      'Tgl Kembali': new Date(borrow.dueDate).toLocaleDateString('id-ID'),
      'Status': borrow.status,
    };
  });
};

// Prepare data for export - Popular Books
export const preparePopularBooksForExport = (
  books: Book[],
  borrowings: Borrowing[]
) => {
  const bookBorrowCount = new Map<string, number>();
  
  borrowings.forEach(borrowing => {
    if (borrowing.status === 'active' || borrowing.status === 'returned') {
      borrowing.details.forEach(detail => {
        const currentCount = bookBorrowCount.get(detail.bookId) || 0;
        bookBorrowCount.set(detail.bookId, currentCount + detail.quantity);
      });
    }
  });

  const popularBooks = Array.from(bookBorrowCount.entries())
    .map(([bookId, count]) => {
      const book = books.find(b => b.id === bookId);
      return {
        'Judul': book?.title || '-',
        'Penulis': book?.author || '-',
        'Kategori': book?.category || '-',
        'Total Dipinjam': count,
        'Stok Tersedia': book?.stock || 0,
      };
    })
    .sort((a, b) => b['Total Dipinjam'] - a['Total Dipinjam'])
    .slice(0, 10);

  return popularBooks;
};

// Prepare data for export - Active Members
export const prepareActiveMembersForExport = (
  users: User[],
  borrowings: Borrowing[]
) => {
  const members = users.filter(u => u.role === 'member');
  
  return members.map(member => {
    const memberBorrowings = borrowings.filter(
      b => b.userId === member.id && (b.status === 'active' || b.status === 'pending')
    );
    
    const totalBooks = memberBorrowings.reduce(
      (sum, b) => sum + b.details.reduce((s, d) => s + d.quantity, 0),
      0
    );

    return {
      'ID Anggota': member.membershipId,
      'Nama': member.name,
      'Email': member.email,
      'No. HP': member.phone,
      'Tgl Daftar': member.joinDate,
      'Peminjaman Aktif': memberBorrowings.length,
      'Total Buku Dipinjam': totalBooks,
    };
  });
};
