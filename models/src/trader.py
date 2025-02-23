from dataclasses import dataclass
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

@dataclass
class TradeAction:
    timestamp: int
    coin: str
    price: float
    action: int  # -1: sell, 0: hold, 1: buy
    position_size: float
    technical_features: Dict[str, float]

class BaseTrader:
    def __init__(self, initial_balance: float = 100000):
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.positions: Dict[str, float] = {}
        self.trades: List[TradeAction] = []

    def get_technical_features(self, df, idx: int) -> Dict[str, float]:
        feature_cols = ['rsi', 'macd', 'macd_signal', 'bollinger_high', 'bollinger_low', 
                       'bollinger_mid', 'sma_20', 'sma_50', 'ema_12', 'ema_26', 'volume_sma_20']
        return {col: df[col].iloc[idx] for col in feature_cols}

    def execute_trade(self, timestamp: int, coin: str, price: float, 
                     action: int, position_size: float, features: Dict[str, float]):
        if action == 1:  # Buy
            cost = position_size * price
            if cost <= self.balance:
                self.balance -= cost
                self.positions[coin] = self.positions.get(coin, 0) + position_size
        elif action == -1:  # Sell
            if coin in self.positions and self.positions[coin] >= position_size:
                self.balance += position_size * price
                self.positions[coin] -= position_size
                if self.positions[coin] == 0:
                    del self.positions[coin]

        self.trades.append(TradeAction(
            timestamp=timestamp,
            coin=coin,
            price=price,
            action=action,
            position_size=position_size,
            technical_features=features
        ))

class MomentumTrader(BaseTrader):
    def __init__(self, momentum_window: int = 5, 
                 buy_threshold: float = 0.02,
                 sell_threshold: float = -0.01,
                 initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)
        self.momentum_window = momentum_window
        self.buy_threshold = buy_threshold
        self.sell_threshold = sell_threshold
        
    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:
        if idx < self.momentum_window:
            return 0, 0
        
        price = df['price'].iloc[idx]
        past_price = df['price'].iloc[idx - self.momentum_window]
        momentum = (price - past_price) / past_price
        
        if momentum > self.buy_threshold:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / price
            return 1, position_size
        elif momentum < self.sell_threshold:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size
        
        return 0, 0

class MeanReversionTrader(BaseTrader):
    def __init__(self, initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)

    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:  
        if idx < 50:
            return 0, 0

        price = df['price'].iloc[idx]
        sma_20 = df['sma_20'].iloc[idx]
        sma_50 = df['sma_50'].iloc[idx]
        
        if price < sma_20 and sma_20 < sma_50:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / price
            return 1, position_size
        elif price > sma_20 and sma_20 > sma_50:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size
        
        return 0, 0

class BreakoutTrader(BaseTrader):
    def __init__(self, initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)

    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:
        if idx < 20:
            return 0, 0
        
        price = df['price'].iloc[idx]
        upper_band = df['bollinger_high'].iloc[idx]
        lower_band = df['bollinger_low'].iloc[idx]
        
        if price > upper_band:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / price
            return 1, position_size
        elif price < lower_band:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size
        
        return 0, 0

class TrendFollowingTrader(BaseTrader):  
    def __init__(self, initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)

    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:
        if idx < 26:
            return 0, 0
        
        ema_12 = df['ema_12'].iloc[idx]
        ema_26 = df['ema_26'].iloc[idx]
        prev_ema_12 = df['ema_12'].iloc[idx-1] 
        prev_ema_26 = df['ema_26'].iloc[idx-1]
        
        if prev_ema_12 <= prev_ema_26 and ema_12 > ema_26:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / df['price'].iloc[idx] 
            return 1, position_size
        elif prev_ema_12 >= prev_ema_26 and ema_12 < ema_26:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size
        
        return 0, 0
    
class RSITrader(BaseTrader):
    def __init__(self, initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)

    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:
        if idx < 14:
            return 0, 0
        
        rsi = df['rsi'].iloc[idx]
        price = df['price'].iloc[idx]
        
        if rsi < 30:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / price
            return 1, position_size
        elif rsi > 70:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size

        return 0, 0
    
class VolumeBasedTrader(BaseTrader):
    def __init__(self, initial_balance: float = 10000):
        super().__init__(initial_balance=initial_balance)

    def should_trade(self, coin: str, df, idx: int) -> Tuple[int, float]:
        if idx < 20:
            return 0, 0
        
        volume = df['volume'].iloc[idx]  
        volume_sma = df['volume_sma_20'].iloc[idx]
        price_change = df['price'].iloc[idx] / df['price'].iloc[idx-1] - 1

        if volume > volume_sma * 1.5 and price_change > 0:
            if self.balance <= 0:
                return 0, 0
            position_size = (self.balance * 0.1) / df['price'].iloc[idx]
            return 1, position_size
        elif volume > volume_sma * 1.5 and price_change < 0:
            position = self.positions.get(coin, 0)
            position_size = position * 0.5 if position > 0 else 0
            return -1, position_size

        return 0, 0
        
    def generate_trades(self, df: pd.DataFrame, n_trades: int = 50) -> List[Dict]:
        """Generate sample trades based on technical indicators"""
        self.trades = []  # Reset trades
        self.balance = self.initial_balance  # Reset balance
        self.positions = {}  # Reset positions
        
        for _ in range(n_trades):
            idx = np.random.randint(0, len(df)-1)
            price = df['price'].iloc[idx]
            
            # Combined trading strategy using multiple indicators
            rsi = df['rsi'].iloc[idx]
            macd = df['macd'].iloc[idx]
            bb_high = df['bb_high'].iloc[idx]
            bb_low = df['bb_low'].iloc[idx]
            
            # Buy signals
            buy_signal = (
                (rsi < 30) or  # Oversold
                (price < bb_low) or  # Below lower Bollinger Band
                (macd > 0 and df['macd'].iloc[idx-1] < 0)  # MACD crossover
            )
            
            # Sell signals
            sell_signal = (
                (rsi > 70) or  # Overbought
                (price > bb_high) or  # Above upper Bollinger Band
                (macd < 0 and df['macd'].iloc[idx-1] > 0)  # MACD crossover
            )
            
            action = 1 if buy_signal else (-1 if sell_signal else 0)
            
            if action != 0:
                trade = {
                    'timestamp': df['timestamp'].iloc[idx],
                    'price': price,
                    'action': action,
                    'rsi': rsi,
                    'macd': macd,
                    'sma_20': df['sma_20'].iloc[idx],
                    'ema_12': df['ema_12'].iloc[idx],
                    'volume_sma': df['volume_sma'].iloc[idx],
                    'bb_high': bb_high,
                    'bb_low': bb_low,
                    'bb_mid': df['bb_mid'].iloc[idx]
                }
                
                # Execute trade
                if action == 1:  # Buy
                    position_size = (self.balance * 0.2) / price  # Use 20% of balance
                    if self.balance >= position_size * price:
                        self.balance -= position_size * price
                        self.positions[df['coin'].iloc[idx]] = self.positions.get(df['coin'].iloc[idx], 0) + position_size
                        self.trades.append(trade)
                else:  # Sell
                    if df['coin'].iloc[idx] in self.positions and self.positions[df['coin'].iloc[idx]] >= position_size:
                        self.balance += position_size * price
                        self.positions[df['coin'].iloc[idx]] -= position_size
                        self.trades.append(trade)
        
        return self.trades
    
    def get_portfolio_values(self, df: pd.DataFrame) -> List[float]:
        """Calculate portfolio value over time"""
        portfolio_values = []
        current_balance = self.initial_balance
        current_positions = {coin: self.positions.get(coin, 0) for coin in self.positions}
        
        # Sort trades by timestamp
        sorted_trades = sorted(self.trades, key=lambda x: x['timestamp'])
        trade_index = 0
        
        for timestamp in df['timestamp']:
            # Execute any trades that happened at this timestamp
            while (trade_index < len(sorted_trades) and 
                   sorted_trades[trade_index]['timestamp'] <= timestamp):
                trade = sorted_trades[trade_index]
                if trade['action'] == 1:  # Buy
                    position_size = (current_balance * 0.2) / trade['price']
                    current_balance -= position_size * trade['price']
                    current_positions[trade['coin']] += position_size
                else:  # Sell
                    if trade['coin'] in current_positions and current_positions[trade['coin']] >= position_size:
                        current_balance += position_size * trade['price']
                        current_positions[trade['coin']] -= position_size
                trade_index += 1
            
            # Calculate portfolio value at this timestamp
            current_price = df[df['timestamp'] == timestamp]['price'].iloc[0]
            portfolio_value = current_balance + sum(position * current_price for position in current_positions.values())
            portfolio_values.append(portfolio_value)
        
        return portfolio_values 