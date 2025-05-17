// 출고 요청 컴포넌트 전체 수정본 (제품사진, 출고증 사진 포함 + 검색창 4개 복원)

import React, { useState, useEffect } from 'react';


const formatPhoneNumber = (value) => {
  const onlyNums = value.replace(/\D/g, '');
  if (onlyNums.startsWith('02')) {
    if (onlyNums.length <= 2) return onlyNums;
    if (onlyNums.length <= 5) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2)}`;
    if (onlyNums.length <= 9) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 5)}-${onlyNums.slice(5)}`;
    return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 6)}-${onlyNums.slice(6, 10)}`;
  } else {
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 6) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    if (onlyNums.length <= 10) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 6)}-${onlyNums.slice(6)}`;
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
  }
};

const formatDateWithDash = (value) => {
  const onlyNums = value.replace(/\D/g, '').slice(0, 6);
  if (onlyNums.length < 3) return onlyNums;
  if (onlyNums.length < 5) return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2)}`;
  return `${onlyNums.slice(0, 2)}-${onlyNums.slice(2, 4)}-${onlyNums.slice(4, 6)}`;
};

const formatNumberWithCommas = (value) => {
  const num = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(num) ? '' : num.toLocaleString();
};

const DeliveryRequest = () => {
  const confirmDelete = () => {
  const updated = requests.filter((_, i) => i !== pendingDeleteIndex);
  setRequests(updated);
  setShowConfirm(false);
  setPendingDeleteIndex(null);
};
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
  
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('deliveryRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: '', productName: '', spec: '', quantity: '', unitPrice: '',
    warehouseName: '', warehousePhone: '', warehouseFax: '',
    supplierName: '', supplierPhone: '',
    groupOrder: '', completed: false, completedAt: '', memo: '',
    productImage: '', receiptImage: ''
  });

  const [searchFilter,setSearchFilter] = useState({
    date: '', productName: '', warehouseName: '', supplierName: ''
  });

  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === 'date' && type!=="date") {
      formattedValue = formatDateWithDash(value);
    } else if (['warehousePhone', 'warehouseFax', 'supplierPhone'].includes(name)) {
      formattedValue = formatPhoneNumber(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.supplierName || form.supplierName.trim().length < 2) {
  alert("올바른 매입처명을 입력해 주세요.");
  return;
}

    const newRequest = {
      ...form,
      quantity: parseInt(form.quantity, 10) || 0,
      unitPrice: parseFloat(form.unitPrice.toString().replace(/,/g, '')) || 0,
      groupOrder: parseInt(form.groupOrder, 10) || 0,
      completedAt: form.completed ? new Date().toISOString() : '',
      productImage: form.productImage || (editIndex !== null ? requests[editIndex].productImage : ''),
      receiptImage: form.receiptImage || (editIndex !== null ? requests[editIndex].receiptImage : '')
    };

    if (editIndex !== null) {
      const updated = [...requests];
      updated[editIndex] = newRequest;
      setRequests(updated);
    } else {
      setRequests([...requests, newRequest]);
    }

    setForm({
      date: '', productName: '', spec: '', quantity: '', unitPrice: '',
      warehouseName: '', warehousePhone: '', warehouseFax: '',
      supplierName: '', supplierPhone: '',
      groupOrder: '', completed: false, completedAt: '', memo: '',
      productImage: '', receiptImage: ''
    });
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const item = requests[index];
    setForm({
      ...item,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      groupOrder: item.groupOrder.toString(),
      productImage: item.productImage || '',
      receiptImage: item.receiptImage || ''

    });
    setEditIndex(index);
  };
const handleCancel = () => {
  setForm({
    date: '', productName: '', spec: '', quantity: '', unitPrice: '',
    warehouseName: '', warehousePhone: '', warehouseFax: '',
    supplierName: '', supplierPhone: '',
    groupOrder: '', completed: false, completedAt: '', memo: '',
    productImage: '', receiptImage: ''
  });
  setEditIndex(null);
};

  const handleDelete = (index) => {
  setPendingDeleteIndex(index);
  setShowConfirm(true);
};
  

  useEffect(() => {
    localStorage.setItem('deliveryRequests', JSON.stringify(requests));
  }, [requests]);

  const sortedRequests = requests
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => (
      (searchFilter.date === '' || item.date === searchFilter.date) &&
      item.productName.toLowerCase().includes(searchFilter.productName.toLowerCase()) &&
      item.warehouseName.toLowerCase().includes(searchFilter.warehouseName.toLowerCase()) &&
      item.supplierName.toLowerCase().includes(searchFilter.supplierName.toLowerCase())
    ))
    .sort((a, b) => a.groupOrder - b.groupOrder);
    useEffect(() => {
  console.log("editIndex 상태:", editIndex);
}, [editIndex]);
useEffect(() => {
  const found = requests.find(r => r.supplierName === form.supplierName);
  if (found) {
    setForm(prev => ({
      ...prev,
      supplierPhone: found.supplierPhone
    }));
  }
}, [form.supplierName, requests]);
useEffect(() => {
  const found = requests.find(r => r.warehouseName === form.warehouseName);
  if (found) {
    setForm(prev => ({
      ...prev,
      warehousePhone: found.warehousePhone,
      warehouseFax: found.warehouseFax
    }));
  }
}, [form.warehouseName, requests]);
useEffect(() => {
  const saved = localStorage.getItem('deliveryRequests');
  if (saved) {
    const parsed = JSON.parse(saved);
    const cleaned = parsed.filter(r => r.supplierName && r.supplierName.length >= 2 && !/[^가-힣a-zA-Z0-9\s]/.test(r.supplierName));
    setRequests(cleaned);
  }
}, []);


  return (
    <div style={{ padding: '20px', maxWidth: 'auto', margin: 'auto', fontFamily: '맑은 고딕', fontSize: '13px' }}>
      <h2>창고 출고 요청</h2>  

{/* 📦 출고관리 1차완성 → 입력 + 목록(출고 리스트 테이블) 복원본*/}
{/* 폼구간 163~253 까지 */}
<datalist id="supplierNameList">
  {[...new Set(requests.map(r => r.supplierName?.trim()))]
    .filter(name =>
      name &&
      name.length >= 2 &&
      !/[^가-힣a-zA-Z0-9\s]/.test(name)  // 특수문자 제거
    )
    .map((name, i) => <option key={i} value={name} />)}
</datalist>

<datalist id="productNameList">
  {[...new Set(requests.map((r) => r.productName))]
    .filter(Boolean)
    .map((name, i) => <option key={i} value={name} />)}
</datalist>
<datalist id="supplierNameList">
  {[...new Set(requests.map((r) => r.supplierName))].filter(Boolean).map((name, i) => (
    <option key={i} value={name} />
  ))}
</datalist>
<datalist id="warehouseNameList">
  {[...new Set(requests.map((r) => r.warehouseName))].filter(Boolean).map((name, i) => (
    <option key={i} value={name} />
  ))}
</datalist>

<form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
    <thead style={{ background: '#e0e0e0', color: '#333', fontWeight: 'bold' }}>
      {/* 테이블 헤더 */}
      <tr>
        <th style={{ border: '1px solid #000' }}>순번</th>
        <th style={{ border: '1px solid #000' }}>완료</th>
        <th style={{ border: '1px solid #000' }}>날짜</th>
        <th style={{ border: '1px solid #000' }}>제품명</th>
        <th style={{ border: '1px solid #000' }}>규격</th>
        <th style={{ border: '1px solid #000' }}>수량</th>
        <th style={{ border: '1px solid #000' }}>단가</th>
        <th style={{ border: '1px solid #000' }}>창고명</th>
        <th style={{ border: '1px solid #000' }}>전화</th>
        <th style={{ border: '1px solid #000' }}>팩스</th>
        <th style={{ border: '1px solid #000' }}>매입처</th>
        <th style={{ border: '1px solid #000' }}>연락처</th>
        <th style={{ border: '1px solid #000' }}>출고증</th>
        <th style={{ border: '1px solid #000' }}>제품사진</th>
        <th style={{ border: '1px solid #000' }}>비고</th>
      </tr>
    </thead>
    {/* 입력파트 */}
    <tbody>
      <tr>
        <td><input name="groupOrder" type="number" value={form.groupOrder} onChange={handleChange} style={{ width: '30px' }} /></td>
        <td><input name="completed" type="checkbox" checked={form.completed} onChange={handleChange} /></td>
        <td><input name="date" type="date" value={form.date} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><input name="productName"list="productNameList" value={form.productName} onChange={handleChange} style={{ width: '150px' }} /></td>
        <td><input name="spec" value={form.spec} onChange={handleChange} style={{ width: '150px' }} /></td>
        <td><input name="quantity" value={form.quantity} onChange={handleChange} style={{ width: '30px' }} /></td>
        <td><input
          name="unitPrice"
          value={formatNumberWithCommas(form.unitPrice)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (!isNaN(raw)) setForm((prev) => ({ ...prev, unitPrice: raw }));
          }}
          style={{ width: '80px' }}
        /></td>
        <td><input name="warehouseName"list="warehouseNameList" value={form.warehouseName} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><input name="warehousePhone" value={form.warehousePhone} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><input name="warehouseFax" value={form.warehouseFax} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><input name="supplierName"list="supplierNameList" value={form.supplierName} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><input name="supplierPhone" value={form.supplierPhone} onChange={handleChange} style={{ width: '120px' }} /></td>
        <td><label style={{display: 'inline-block', background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
    fontSize: '12px'
  }}>
    사진
    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, 'receiptImage')} style={{ display: 'none' }}/>
  </label></td>
        <td><label style={{display: 'inline-block', background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
    fontSize: '12px'
  }}>
    사진
    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, 'productImage')} style={{ display: 'none' }} />
  </label></td>
        <td><textarea name="memo" value={form.memo} onChange={handleChange} style={{ width: '150px', height: '40px' }} /></td>
      </tr>
    </tbody>
  </table>
  <div style={{ marginTop: '10px' }}>
  <button type="submit">
    {editIndex !== null ? '수정 완료' : '출고 등록'}
  </button>
  <button
    type="button"
    onClick={handleCancel}
    style={{
      marginLeft: '12px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc'
    }}
  >
    입력 취소
  </button>
</div>


</form>
{/*조회파트(찾기)*/ }
<h3 style={{ marginTop: '30px' }}>출고 목록 (순번 정렬)</h3>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
  <input type="date" placeholder="YY-MM-DD" value={searchFilter.date} onChange={(e) => setSearchFilter({ ...searchFilter, date: e.target.value })} />
  <input type="text" placeholder="제품명" value={searchFilter.productName} onChange={(e) => setSearchFilter({ ...searchFilter, productName: e.target.value })} />
  <input type="text" placeholder="창고명" value={searchFilter.warehouseName} onChange={(e) => setSearchFilter({ ...searchFilter, warehouseName: e.target.value })} />
  <input type="text" placeholder="매입처" value={searchFilter.supplierName} onChange={(e) => setSearchFilter({ ...searchFilter, supplierName: e.target.value })} />
{/* 데이터저장파트 및 불러오기 버튼 */}
  <button
    onClick={() => {
      const blob = new Blob([JSON.stringify(requests, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliveryRequests.json';
      a.click();
      URL.revokeObjectURL(url);
    }}
  >
    저장하기
  </button>
  <input
    type="file"
    accept="application/json"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          setRequests(data);
        } catch {
          alert('불러오기에 실패했습니다.');
        }
      };
      reader.readAsText(file);
    }}
  />
  
</div> 

{/* 목록테이블 파트 */}
<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', marginTop: '20px' }}>
  <table style={{ width: '100%', borderTop: '1px solid #ccc', fontSize: '14px' }}>
    <thead style={{ background: '#e0e0e0' }}>
      <tr>
        <th>순번</th>
        <th>날짜</th>
        <th>제품명</th>
        <th>규격</th>
        <th>수량</th>
        <th>단가</th>
        <th>창고명</th>
        <th>창고 전화</th>
        <th>창고 팩스</th>
        <th>매입처</th>
        <th>매입처 전화</th>
        <th>제품사진</th>
        <th>출고증</th>
        <th>비고</th>
        <th>완료</th>
        <th>수정/삭제</th>
      </tr>
    </thead>
    <tbody>
      {sortedRequests
  .sort((a, b) => {
    if (a.date === b.date) return a.groupOrder - b.groupOrder;
    return b.date.localeCompare(a.date); // 최신 날짜가 위로
  })
  .map((req, idx) => (

        <tr key={idx}>
          <td>{req.groupOrder}</td>
          <td>{req.date?.slice(5).replace('-', '/')}</td>
          <td>{req.productName}</td>
          <td>{req.spec}</td>
          <td>{req.quantity}</td>
          <td>{req.unitPrice.toLocaleString()}</td>
          <td>{req.warehouseName}</td>
          <td>{req.warehousePhone}</td>
          <td>{req.warehouseFax}</td>
          <td>{req.supplierName}</td>
          <td>{req.supplierPhone}</td>
          <td>{req.productImage && <img src={req.productImage} alt="제품" style={{ width: '60px' }} />}</td>
          <td>{req.receiptImage && <img src={req.receiptImage} alt="출고증" style={{ width: '60px' }} />}</td>
          <td>{req.memo}</td>
          <td>{req.completed ? '✅' : ''}</td>
          <td>
            <button onClick={() => handleEdit(req.originalIndex)}>수정</button>
            <button onClick={() => handleDelete(req.originalIndex)}>삭제</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* 삭제 확인 모달 */}
{showConfirm && (
  <div style={{
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    background: 'white', border: '1px solid #ccc', padding: '20px', zIndex: 1000,
    boxShadow: '0 0 10px rgba(0,0,0,0.3)'
  }}>
    <p>정말 삭제하시겠습니까?</p>
    <button onClick={confirmDelete}>삭제</button>
    <button onClick={() => setShowConfirm(false)}>취소</button>
  </div>
)}  
</div>  
  )};
export default DeliveryRequest;