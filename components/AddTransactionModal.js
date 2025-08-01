import { useState, useEffect } from "react"
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform, ActivityIndicator, Image } from "react-native"
import SearchableInputModal from "./SearchableInputModal"
import { fetchSubcategoriesByCategoryId } from "../api/subcategories"
import { addTransaction, updateTransaction } from "../api/transactions"
import DateTimePicker from "@react-native-community/datetimepicker"
import { addCategory } from "../api/categories";
import { addSubcategory } from "../api/subcategories";
import { addVendor } from "../api/vendors";
import { addAccount } from "../api/accounts";
import { updateCategory } from "../api/categories";
import { updateVendor } from "../api/vendors";
import { updateAccount } from "../api/accounts";
import { updateSubcategory } from "../api/subcategories";
import ReceiptUploader from "./ReceiptUploader";
import { extractReceiptData } from "../api/receipts";
import { getReceiptById } from "../api/receipts";

export default function AddTransactionModal({
  visible,
  onClose,
  onSubmit,
  accounts,
  setAccounts,
  categories,
  setCategories,
  setSubcategoryMap,
  vendors,
  setVendors,
  token,
  userId,
  // props for editing mode
  isEditing = false,
  editingTransaction = null,
}) {
  const [type, setType] = useState("in")
  const [details, setDetails] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [bankAmount, setBankAmount] = useState("")
  const [creditCardAmount, setCreditCardAmount] = useState("")
  const [vatEnabled, setVatEnabled] = useState(false)
  const [vatAmount, setVatAmount] = useState("")
  const [vatPercent, setVatPercent] = useState("20");
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [account, setAccount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [subcategory, setSubcategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiced, setInvoiced] = useState(false)
  const [vendor, setVendor] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vatMode, setVatMode] = useState("amount");
  const [receiptImage, setReceiptImage] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [existingReceiptImage, setExistingReceiptImage] = useState(null);
  const [loadingExistingReceipt, setLoadingExistingReceipt] = useState(false);

  // Always recalculate options from latest state before rendering
  const accountOptions = accounts.map((a) => a.accountNo);
  const categoryOptions = categories.map((c) => c.name);
  const vendorOptions = vendors.map((v) => v.name);
  const subcategoryOptionsList = subcategoryOptions.map((s) => s.name);

  // Load transaction data when editing
  useEffect(() => {
    if (isEditing && editingTransaction) {
      
      // Set transaction type
      setType(editingTransaction.type === "moneyIn" ? "in" : "out");
      
      // Set amounts
      setCashAmount(editingTransaction.amount_cash?.toString() || "");
      setBankAmount(editingTransaction.amount_bank?.toString() || "");
      setCreditCardAmount(editingTransaction.amount_creditcard?.toString() || "");
      
      // Set description
      setDetails(editingTransaction.desc3 || "");
      
      // Set VAT
      if (editingTransaction.vat_gst_amount || editingTransaction.vat_gst_percentage) {
        setVatEnabled(true);
        if (editingTransaction.vat_gst_percentage) {
          setVatMode("percent");
          setVatPercent(editingTransaction.vat_gst_percentage.toString());
        } else {
          setVatMode("amount");
          setVatAmount(editingTransaction.vat_gst_amount?.toString() || "");
        }
      }
      
      // Set invoice details
      setInvoiceAmount(editingTransaction.invoice_amount?.toString() || "");
      if (editingTransaction.invoice_date) {
        setInvoiceDate(new Date(editingTransaction.invoice_date));
      }
      setInvoiced(editingTransaction.invoiced === "yes");
      
      // Set category and subcategory
      if (editingTransaction.category) {
        const categoryObj = categories.find(c => c.id === editingTransaction.category);
        if (categoryObj) {
          setCategory(categoryObj.name);
          setSelectedCategory(categoryObj);
        }
      }
      let accountFound = false;
      
      // Try to find account by ID first
      if (editingTransaction.accountNo) {
        const accountObj = accounts.find(a => a.id === editingTransaction.accountNo);
        if (accountObj) {
          setAccount(accountObj.accountNo);
          setSelectedAccount(accountObj);
          accountFound = true;
        }
      } else if (editingTransaction.accountno) {
        const accountObj = accounts.find(a => a.id === editingTransaction.accountno);
        if (accountObj) {
          setAccount(accountObj.accountNo);
          setSelectedAccount(accountObj);
          accountFound = true;
        }
      } else if (editingTransaction.account) {
        const accountObj = accounts.find(a => a.id === editingTransaction.account);
        if (accountObj) {
          setAccount(accountObj.accountNo);
          setSelectedAccount(accountObj);
          accountFound = true;
        }
      }
      
      // If not found by ID, try to set the account number as a string
      if (!accountFound) {
        if (editingTransaction.accountNo) {
          setAccount(editingTransaction.accountNo.toString());
        } else if (editingTransaction.accountno) {
          setAccount(editingTransaction.accountno.toString());
        } else if (editingTransaction.account) {
          setAccount(editingTransaction.account.toString());
        }
      }
      
      // Set vendor - check multiple possible field names
      if (editingTransaction.vendorId) {
        const vendorObj = vendors.find(v => v.id === editingTransaction.vendorId);
        if (vendorObj) {
          setVendor(vendorObj.name);
          setSelectedVendor(vendorObj);
        }
      } else if (editingTransaction.vendorName) {
        // If vendorId is not available, try to find vendor by name
        const vendorObj = vendors.find(v => v.name === editingTransaction.vendorName);
        if (vendorObj) {
          setVendor(vendorObj.name);
          setSelectedVendor(vendorObj);
        } else {
          setVendor(editingTransaction.vendorName);
        }
      } else if (editingTransaction.vendorname) {
        // Fallback for old field name
        const vendorObj = vendors.find(v => v.name === editingTransaction.vendorname);
        if (vendorObj) {
          setVendor(vendorObj.name);
          setSelectedVendor(vendorObj);
        } else {
          setVendor(editingTransaction.vendorname);
        }
      }

      // Load existing receipt image if available
      if (editingTransaction.receipt) {
        setLoadingExistingReceipt(true);
        getReceiptById(token, editingTransaction.receipt)
          .then(res => {
            if (res.data) {
              setExistingReceiptImage({
                uri: `data:image/jpeg;base64,${res.data}`,
                fileName: `receipt_${editingTransaction.id}.jpg`,
                mimeType: "image/jpeg",
              });
            }
          })
          .catch(err => {
            console.log("Failed to load existing receipt:", err);
          })
          .finally(() => {
            setLoadingExistingReceipt(false);
          });
      }
    }
  }, [isEditing, editingTransaction, categories, accounts, vendors]);

  // Set subcategory 
  useEffect(() => {
    if (isEditing && editingTransaction && editingTransaction.sub_category1 && subcategoryOptions.length > 0) {
      const subcategoryObj = subcategoryOptions.find(s => s.id === editingTransaction.sub_category1);
      if (subcategoryObj) {
        setSubcategory(subcategoryObj.name);
        setSelectedSubcategory(subcategoryObj);
      }
    }
  }, [isEditing, editingTransaction, subcategoryOptions]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const found = categories.find((c) => c.name === newCategory);
    setSelectedCategory(found || null);
    setSubcategory("");
    setSelectedSubcategory(null);
  };
  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
    const found = accounts.find((a) => a.accountNo === newAccount);
    setSelectedAccount(found || null);
  };
  const handleSubcategoryChange = (newSubcat) => {
    setSubcategory(newSubcat);
    const found = (Array.isArray(subcategoryOptions) ? subcategoryOptions : []).find((s) => s.name === newSubcat);
    setSelectedSubcategory(found || null);
  };
  const handleVendorChange = (newVendor) => {
    setVendor(newVendor);
    const found = vendors.find((v) => v.name === newVendor);
    setSelectedVendor(found || null);
  };

  // Fetch subcategories when category changes 
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategoriesByCategoryId(selectedCategory.id, token).then((subcats) => {
        setSubcategoryOptions(subcats);
      });
    } else {
      setSubcategoryOptions([]);
    }
    if (!isEditing) {
    setSubcategory("");
    setSelectedSubcategory(null);
    }
  }, [selectedCategory, categories, token, isEditing]);

  const totalAmount =
    (Number.parseFloat(cashAmount) || 0) +
    (Number.parseFloat(bankAmount) || 0) +
    (Number.parseFloat(creditCardAmount) || 0)

  const resetForm = () => {
    setType("in")
    setDetails("")
    setCashAmount("")
    setBankAmount("")
    setCreditCardAmount("")
    setVatEnabled(false)
    setVatAmount("")
    setVatPercent("20")
    setCategory("")
    setSubcategory("")
    setInvoiceAmount("")
    setInvoiceDate(new Date());
    setInvoiced(false)
    setVendor("")
    setReceiptImage(null);
    setSelectedCategory(null);
    setSelectedAccount(null);
    setSelectedSubcategory(null);
    setSelectedVendor(null);
    setExistingReceiptImage(null);
    setLoadingExistingReceipt(false);
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      let categoryId = selectedCategory ? selectedCategory.id : null;
      let vendorId = selectedVendor ? selectedVendor.id : null;
      let accountId = selectedAccount ? selectedAccount.id : null;
      let subcategoryId = selectedSubcategory ? selectedSubcategory.id : null;

      // 1. Create custom category if needed
      if (!categoryId && category) {
        const newCategory = await addCategory(category, token, userId);
        categoryId = newCategory.id;
      }
      // 2. Create custom vendor if needed
      if (!vendorId && vendor) {
        const newVendor = await addVendor(vendor, token, userId);
        vendorId = newVendor.id;
      }
      // 3. Create custom account if needed
      if (!accountId && account) {
        const newAccount = await addAccount(account, token, userId);
        accountId = newAccount.id;
      }
      // 4. Create custom subcategory if needed
      if (!subcategoryId && subcategory && categoryId) {
        const newSubcat = await addSubcategory(subcategory, categoryId, token);
        subcategoryId = newSubcat.id;
      }

      if (isEditing && editingTransaction) {
        // Update existing transaction
        const formData = new FormData();
        formData.append("transactionId", editingTransaction.id);
        formData.append("newAmount", isNaN(Number(totalAmount)) ? 0 : Number(totalAmount));
        formData.append("newAmountbank", isNaN(Number(bankAmount)) ? 0 : Number(bankAmount));
        formData.append("newAmountcash", isNaN(Number(cashAmount)) ? 0 : Number(cashAmount));
        formData.append("newAmountcreditcard", isNaN(Number(creditCardAmount)) ? 0 : Number(creditCardAmount));
        formData.append("newCategory", categoryId);
        formData.append("newDesc3", details || "");
        formData.append("newInvoiceamount", isNaN(Number(invoiceAmount)) ? 0 : Number(invoiceAmount));
        formData.append("newInvoicedate", invoiceDate instanceof Date ? invoiceDate.toISOString() : "");
        formData.append("newInvoiced", invoiced === true ? 'yes' : invoiced === false ? 'no' : "");
        formData.append("newsubCategory1", subcategoryId);
        formData.append("newType", type === "in" ? "moneyIn" : "moneyOut");
        formData.append("accountNo", accountId);
        if (vatEnabled) {
          if (vatMode === "amount" && vatAmount) {
            formData.append("vat_gst_amount", Number(vatAmount));
          } else if (vatMode === "percent" && vatPercent) {
            formData.append("vat_gst_percentage", Number(vatPercent));
            formData.append("vat_gst_amount", totalAmount ? Number((Number(totalAmount) * Number(vatPercent) / 100).toFixed(2)) : "");
          }
        }
        formData.append("vendorId", vendorId);
        if (receiptImage && receiptImage.uri) {
          const fileName = receiptImage.fileName || receiptImage.uri.split("/").pop();
          formData.append("file", {
            uri: receiptImage.uri,
            name: fileName,
            type: receiptImage.mimeType || "image/jpeg",
          });
        }
        await updateTransaction(formData, token, userId, true);
      } else {
        // Create new transaction
        const formData = new FormData();
        formData.append("accountNo", accountId);
        formData.append("amount", isNaN(Number(totalAmount)) ? 0 : Number(totalAmount));
        formData.append("amount_bank", isNaN(Number(bankAmount)) ? 0 : Number(bankAmount));
        formData.append("amount_cash", isNaN(Number(cashAmount)) ? 0 : Number(cashAmount));
        formData.append("amount_creditcard", isNaN(Number(creditCardAmount)) ? 0 : Number(creditCardAmount));
        formData.append("category", categoryId);
        formData.append("desc3", details || "");
        formData.append("invoice_amount", isNaN(Number(invoiceAmount)) ? 0 : Number(invoiceAmount));
        formData.append("invoice_date", invoiceDate instanceof Date ? invoiceDate.toISOString() : "");
        formData.append("isInvoiced", invoiced === true ? 'yes' : invoiced === false ? 'no' : "");
        formData.append("sub_category1", subcategoryId);
        formData.append("type", type === "in" ? "moneyIn" : "moneyOut");
        formData.append("userId", userId);
        if (vatEnabled) {
          if (vatMode === "amount" && vatAmount) {
            formData.append("vat_gst_amount", Number(vatAmount));
          } else if (vatMode === "percent" && vatPercent) {
            formData.append("vat_gst_percentage", Number(vatPercent));
            formData.append("vat_gst_amount", totalAmount ? Number((Number(totalAmount) * Number(vatPercent) / 100).toFixed(2)) : "");
          }
        }
        formData.append("vendorId", vendorId);
        formData.append("isDeleted", false);
        if (receiptImage && receiptImage.uri) {
          const fileName = receiptImage.fileName || receiptImage.uri.split("/").pop();
          formData.append("file", {
            uri: receiptImage.uri,
            name: fileName,
            type: receiptImage.mimeType || "image/jpeg",
          });
        }
        await addTransaction(formData, token, userId, true);
      }
      
      if (onSubmit) onSubmit({});
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'add'} transaction`);
    } finally {
      setLoading(false);
    }
  };

  // functions to get editable options and handle edit for each dropdown
  const categoryNames = categories.map(c => c.name);
  const vendorNames = vendors.map(v => v.name);
  const accountNames = accounts.map(a => a.accountNo);
  const subcategoryNames = subcategoryOptions.map(s => s.name);

  const handleEditCategoryOption = async (oldName, newName) => {
    const cat = categories.find(c => c.name === oldName);
    if (cat) {
      try {
        await updateCategory(cat.id, newName, token);
        setCategory(newName);
        setSelectedCategory({ ...cat, name: newName });
        if (setCategories) {
          setCategories(categories.map(c => c.id === cat.id ? { ...c, name: newName } : c));
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to update category");
      }
    }
  };
  const handleEditVendorOption = async (oldName, newName) => {
    const vend = vendors.find(v => v.name === oldName);
    if (vend) {
      try {
        await updateVendor(vend.id, newName, token);
        setVendor(newName);
        setSelectedVendor({ ...vend, name: newName });
        if (setVendors) {
          setVendors(vendors.map(v => v.id === vend.id ? { ...v, name: newName } : v));
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to update vendor");
      }
    }
  };
  const handleEditAccountOption = async (oldName, newName) => {
    const acc = accounts.find(a => a.accountNo === oldName);
    if (acc) {
      try {
        await updateAccount(acc.id, newName, token);
        setAccount(newName);
        setSelectedAccount({ ...acc, accountNo: newName });
        if (setAccounts) {
          setAccounts(accounts.map(a => a.id === acc.id ? { ...a, accountNo: newName } : a));
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to update account");
      }
    }
  };
  const handleEditSubcategoryOption = async (oldName, newName) => {
    const subcat = subcategoryOptions.find(s => s.name === oldName);
    if (subcat && selectedCategory) {
      try {
        await updateSubcategory(subcat.id, newName, selectedCategory.id, token);
        setSubcategory(newName);
        setSelectedSubcategory({ ...subcat, name: newName });
        setSubcategoryOptions(subcategoryOptions.map(s => s.id === subcat.id ? { ...s, name: newName } : s));
        if (setSubcategoryMap) {
          setSubcategoryMap(prev => ({ ...prev, [subcat.id]: newName }));
        }
        setError("");
      } catch (err) {
        setError(err.message || "Failed to update subcategory");
      }
    }
  };

  const handleExtractReceiptData = async () => {
    if (!receiptImage) return;
    setExtracting(true);
    try {
      const file = {
        uri: receiptImage.uri,
        name: receiptImage.fileName || receiptImage.uri.split("/").pop(),
        type: receiptImage.mimeType || "image/jpeg",
      };
      const result = await extractReceiptData(file, token);
      // mapping
      if (result.amount !== undefined) setCashAmount(result.amount.toString());
      // CATEGORY
      if (result.category && result.category !== "Unknown") {
        setCategory(result.category);
        let found = categories.find(c => c.name === result.category);
        if (found) {
          setSelectedCategory(found);
        } else {
          try {
            const newCategory = await addCategory(result.category, token, userId);
            setSelectedCategory(newCategory);
            setCategory(newCategory.name);
            if (setCategories) setCategories([...categories, newCategory]);
          } catch (err) {
            setError("Failed to create new category: " + err.message);
          }
        }
      }
      // SUBCATEGORY
      if (result.subcategory && result.subcategory !== "Unknown") {
        setSubcategory(result.subcategory);
        let found = subcategoryOptions.find(s => s.name === result.subcategory);
        if (found && selectedCategory) {
          setSelectedSubcategory(found);
        } else if (selectedCategory) {
          try {
            const newSubcat = await addSubcategory(result.subcategory, selectedCategory.id, token);
            setSelectedSubcategory(newSubcat);
            setSubcategory(newSubcat.name);
            setSubcategoryOptions([...subcategoryOptions, newSubcat]);
            if (setSubcategoryMap) setSubcategoryMap(prev => ({ ...prev, [newSubcat.id]: newSubcat.name }));
          } catch (err) {
            setError("Failed to create new subcategory: " + err.message);
          }
        }
      }
      // VENDOR
      if (result.vendor && result.vendor !== "Unknown") {
        setVendor(result.vendor);
        let found = vendors.find(v => v.name === result.vendor);
        if (found) {
          setSelectedVendor(found);
        } else {
          try {
            const newVendor = await addVendor(result.vendor, token, userId);
            setSelectedVendor(newVendor);
            setVendor(newVendor.name);
            if (setVendors) setVendors([...vendors, newVendor]);
          } catch (err) {
            setError("Failed to create new vendor: " + err.message);
          }
        }
      }
      // ACCOUNT
      if (result.account && result.account !== "Unknown") {
        setAccount(result.account);
        let found = accounts.find(a => a.accountNo === result.account);
        if (found) {
          setSelectedAccount(found);
        } else {
          try {
            const newAccount = await addAccount(result.account, token, userId);
            setSelectedAccount(newAccount);
            setAccount(newAccount.accountNo);
            if (setAccounts) setAccounts([...accounts, newAccount]);
          } catch (err) {
            setError("Failed to create new account: " + err.message);
          }
        }
      }
      if (result.desc1) setDetails(result.desc1);
      if (result.desc2 || result.desc3) {
        setDetails(prev => [prev, result.desc2, result.desc3].filter(Boolean).join(" | "));
      }
      if (result.invoice_date) setInvoiceDate(new Date(result.invoice_date));
      if (result.type) setType(result.type.toLowerCase() === "debit" ? "out" : "in");
    } catch (err) {
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{isEditing ? "Edit Transaction" : "Add Transaction"}</Text>
          
          <Text style={styles.receiptSectionLabel}>Receipt Upload</Text>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptCard}>
            {/* Show existing receipt if editing */}
            {isEditing && (
              <View style={styles.existingReceiptContainer}>
                <Text style={styles.existingReceiptLabel}>Current Receipt:</Text>
                {loadingExistingReceipt ? (
                  <ActivityIndicator color="#1976d2" />
                ) : existingReceiptImage ? (
                  <Image 
                    source={{ uri: existingReceiptImage.uri }} 
                    style={styles.existingReceiptImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.noReceiptText}>No receipt attached</Text>
                )}
                <Text style={styles.existingReceiptNote}>
                  {existingReceiptImage ? "Upload a new image to replace the current receipt" : "Upload a receipt image"}
                </Text>
              </View>
            )}
            
            <ReceiptUploader
              receiptImage={receiptImage}
              setReceiptImage={setReceiptImage}
              onExtractReceiptData={extracting ? undefined : handleExtractReceiptData}
              extracting={extracting}
            />
          </View>

          {/* Transaction Type */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setType("in")}
              style={[styles.typeButton, type === "in" && styles.selected]}
            >
              <Text style={type === "in" ? styles.selectedText : styles.typeButtonText}>Money In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("out")}
              style={[styles.typeButton, type === "out" && styles.selected]}
            >
              <Text style={type === "out" ? styles.selectedText : styles.typeButtonText}>Money Out</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Details */}
          <Text style={styles.label}>Transaction Details</Text>
          <TextInput placeholder="Enter Detail" value={details} onChangeText={setDetails} style={styles.input} />

          {/* Account Number */}
          <SearchableInputModal
            label="Account Number"
            value={account}
            onChange={handleAccountChange}
            options={accountOptions}
            placeholder="Search or type account number"
            editableOptions={accountNames}
            onEditOption={handleEditAccountOption}
          />

          {/* Amount Fields */}
          <Text style={styles.label}>Cash Amount</Text>
          <TextInput
            placeholder="Enter Cash Amount"
            value={cashAmount}
            onChangeText={setCashAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Bank Amount</Text>
          <TextInput
            placeholder="Enter Bank Amount"
            value={bankAmount}
            onChangeText={setBankAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Credit Card Amount</Text>
          <TextInput
            placeholder="Enter Credit Card Amount"
            value={creditCardAmount}
            onChangeText={setCreditCardAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Total Amount */}
          <Text style={styles.label}>Total Amount</Text>
          <Text style={styles.totalAmount}>{totalAmount.toFixed(2)}</Text>

          {/* VAT Options */}
          <View style={styles.row}>
            <Text style={styles.label}>VAT</Text>
            <Switch value={vatEnabled} onValueChange={setVatEnabled} />
          </View>

          {vatEnabled && (
            <>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.vatToggleButton,
                    vatMode === "amount" && styles.vatToggleSelected,
                  ]}
                  onPress={() => {
                    setVatMode("amount");
                    setVatPercent("");
                  }}
                >
                  <Text style={vatMode === "amount" ? styles.vatToggleTextSelected : styles.vatToggleText}>VAT Amount</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.vatToggleButton,
                    vatMode === "percent" && styles.vatToggleSelected,
                  ]}
                  onPress={() => {
                    setVatMode("percent");
                    setVatAmount("");
                  }}
                >
                  <Text style={vatMode === "percent" ? styles.vatToggleTextSelected : styles.vatToggleText}>VAT %</Text>
                </TouchableOpacity>
              </View>
              {vatMode === "amount" && (
                <TextInput
                  placeholder="Enter VAT amount"
                  value={vatAmount}
                  onChangeText={setVatAmount}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
              {vatMode === "percent" && (
                <TextInput
                  placeholder="Enter VAT percentage"
                  value={vatPercent}
                  onChangeText={setVatPercent}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            </>
          )}

          {/* Category */}
          <SearchableInputModal
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="Search or type category name"
            editableOptions={categoryNames}
            onEditOption={handleEditCategoryOption}
          />

          {/* Sub Category */}
          <SearchableInputModal
            label="Sub Category"
            value={subcategory}
            onChange={handleSubcategoryChange}
            options={category ? subcategoryOptionsList : []}
            placeholder={category ? "Search or type subcategory name" : "Please select a category first"}
            editableOptions={subcategoryNames}
            onEditOption={handleEditSubcategoryOption}
          />

          {/* Invoice Amount */}
          <Text style={styles.label}>Invoice Amount</Text>
          <TextInput
            placeholder="Enter invoice Amount"
            value={invoiceAmount}
            onChangeText={setInvoiceAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Invoice Date */}
          <Text style={styles.label}>Invoice Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{invoiceDate ? invoiceDate.toLocaleDateString() : 'Select date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={invoiceDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setInvoiceDate(selectedDate);
              }}
            />
          )}

          {/* Invoiced */}
          <View style={styles.row}>
            <Text style={styles.label}>Invoiced</Text>
            <Switch value={invoiced} onValueChange={setInvoiced} />
          </View>

          {/* Vendor */}
          <SearchableInputModal
            label="Vendor"
            value={vendor}
            onChange={handleVendorChange}
            options={vendorOptions}
            placeholder="Search or type vendor name"
            editableOptions={vendorNames}
            onEditOption={handleEditVendorOption}
          />

          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading || extracting}>
              {(loading || extracting) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#fff" />
                  <Text style={[styles.submitText, { marginLeft: 8 }]}>
                    {extracting ? "Extracting..." : "Loading..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitText}>{isEditing ? "Update" : "Submit"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#1976d2",
  },
  typeButtonText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1976d2",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  vatToggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 2,
    backgroundColor: "#fff",
  },
  vatToggleSelected: {
    backgroundColor: "#1976d2",
  },
  vatToggleText: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  vatToggleTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  receiptSectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 4,
    marginTop: 8,
    textAlign: "left",
    letterSpacing: 0.2,
    paddingLeft: 2,
  },
  receiptDivider: {
    height: 2,
    backgroundColor: "#e3e8f0",
    marginBottom: 12,
    borderRadius: 2,
  },
  receiptCard: {
    backgroundColor: "#f8fafd",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  existingReceiptContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  existingReceiptLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  existingReceiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  existingReceiptNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noReceiptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
}) 