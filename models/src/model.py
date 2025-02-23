import torch
import torch.nn as nn
from typing import Dict, List

class SimpleLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int = 128, num_layers: int = 2, dropout: float = 0.2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_size, 64)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(64, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        out = self.dropout(lstm_out[:, -1, :])
        out = self.fc1(out)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.fc2(out)
        out = self.sigmoid(out)
        return out

class LocalTrainer:
    def __init__(self, input_size: int):
        self.model = SimpleLSTM(input_size)
        self.criterion = nn.BCELoss()
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        
    def train(self, X: torch.Tensor, y: torch.Tensor, epochs: int = 30) -> Dict:
        """Train the model and return its state dict"""
        batch_size = 32
        n_batches = len(X) // batch_size
        
        for epoch in range(epochs):
            total_loss = 0
            for i in range(n_batches):
                start_idx = i * batch_size
                end_idx = start_idx + batch_size
                
                batch_X = X[start_idx:end_idx]
                batch_y = y[start_idx:end_idx]
                
                self.optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = self.criterion(outputs, batch_y)
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
            
            avg_loss = total_loss / n_batches
            if (epoch + 1) % 5 == 0:
                print(f'Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.4f}')
                
        return self.model.state_dict()

def aggregate_models(model_weights_list: List[Dict]) -> Dict:
    """Average the weights of multiple models"""
    averaged_weights = {}
    for key in model_weights_list[0].keys():
        # Stack same layers from different models
        stacked = torch.stack([weights[key] for weights in model_weights_list])
        # Take mean of stacked layers
        averaged_weights[key] = torch.mean(stacked, dim=0)
    return averaged_weights 